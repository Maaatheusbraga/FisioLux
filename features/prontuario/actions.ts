"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/auth/sessao";
import { ProntuarioService } from "@/services/prontuario/prontuario-service";
import {
  altaFormSchema,
  avaliacaoFormSchema,
  evolucaoFormSchema,
  planoFormSchema,
  reabrirFormSchema,
} from "@/lib/validations/prontuario";
import { dadosComplementaresFromFormData } from "@/lib/validations/avaliacao-musculoesqueletica";
import { mensagemDeErro } from "@/lib/errors/app-error";
import { redirectComAviso } from "@/lib/feedback/aviso";

export type ProntuarioActionState = {
  ok: boolean;
  message?: string;
};

const service = new ProntuarioService();

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

function painelPath(pacienteId: string) {
  return `/pacientes/${pacienteId}?aba=prontuario`;
}

function revalidatePaciente(pacienteId: string) {
  revalidatePath(`/pacientes/${pacienteId}`);
  revalidatePath("/prontuario");
}

// ── Avaliação ───────────────────────────────────────────

function avaliacaoFromForm(formData: FormData) {
  const dc = dadosComplementaresFromFormData(formData);
  const hipotese = formData.get("dc_hipotese");
  const diagnostico =
    (formData.get("diagnostico_fisioterapeutico") as string) ||
    (typeof hipotese === "string" && hipotese.trim() ? hipotese.trim() : undefined);

  const objetivosProc = formData
    .getAll("dc_objetivo_proc")
    .map(String)
    .filter(Boolean);
  const objetivosLivres = formData.get("objetivos");
  const objetivos =
    (typeof objetivosLivres === "string" && objetivosLivres.trim()
      ? objetivosLivres.trim()
      : undefined) ||
    (objetivosProc.length > 0 ? objetivosProc.join(", ") : undefined);

  return {
    paciente_id: formData.get("paciente_id"),
    tipo: formData.get("tipo") || "inicial",
    data_avaliacao: formData.get("data_avaliacao"),
    queixa_principal: formData.get("queixa_principal") || undefined,
    exame_fisico: formData.get("exame_fisico") || undefined,
    diagnostico_fisioterapeutico: diagnostico || undefined,
    objetivos: objetivos || undefined,
    observacoes: formData.get("observacoes") || undefined,
    dados_complementares: dc.success ? dc.data : undefined,
  };
}

export async function criarAvaliacaoAction(
  _prev: ProntuarioActionState,
  formData: FormData,
): Promise<ProntuarioActionState> {
  const dc = dadosComplementaresFromFormData(formData);
  if (!dc.success) {
    return {
      ok: false,
      message: dc.error.issues[0]?.message ?? "Dados da ficha inválidos.",
    };
  }

  const parsed = avaliacaoFormSchema.safeParse(avaliacaoFromForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  try {
    const sessao = await exigirSessao();
    await service.criarAvaliacao(sessao, {
      ...parsed.data,
      dados_complementares: dc.data,
    });
    revalidatePaciente(parsed.data.paciente_id);
    redirectComAviso(painelPath(parsed.data.paciente_id), "Avaliação registrada.");
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível salvar a avaliação."),
    };
  }
}

export async function atualizarAvaliacaoAction(
  _prev: ProntuarioActionState,
  formData: FormData,
): Promise<ProntuarioActionState> {
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, message: "Avaliação inválida." };

  const dc = dadosComplementaresFromFormData(formData);
  if (!dc.success) {
    return {
      ok: false,
      message: dc.error.issues[0]?.message ?? "Dados da ficha inválidos.",
    };
  }

  const parsed = avaliacaoFormSchema.safeParse(avaliacaoFromForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  try {
    const sessao = await exigirSessao();
    await service.atualizarAvaliacao(sessao, id, {
      ...parsed.data,
      dados_complementares: dc.data,
    });
    revalidatePaciente(parsed.data.paciente_id);
    redirectComAviso(painelPath(parsed.data.paciente_id), "Avaliação atualizada.");
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível atualizar a avaliação."),
    };
  }
}

export async function excluirAvaliacaoAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const pacienteId = String(formData.get("paciente_id") || "");
  const sessao = await exigirSessao();
  await service.excluirAvaliacao(sessao, id, pacienteId);
  revalidatePaciente(pacienteId);
  redirectComAviso(painelPath(pacienteId), "Avaliação excluída.");
}

function planoFromForm(formData: FormData) {
  return {
    paciente_id: formData.get("paciente_id"),
    data_plano: formData.get("data_plano"),
    objetivos: formData.get("objetivos") || undefined,
    condutas: formData.get("condutas") || undefined,
    frequencia_sugerida: formData.get("frequencia_sugerida") || undefined,
    previsao_sessoes: formData.get("previsao_sessoes") || undefined,
    observacoes: formData.get("observacoes") || undefined,
  };
}

export async function criarPlanoAction(
  _prev: ProntuarioActionState,
  formData: FormData,
): Promise<ProntuarioActionState> {
  const parsed = planoFormSchema.safeParse(planoFromForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  try {
    const sessao = await exigirSessao();
    await service.criarPlano(sessao, parsed.data);
    revalidatePaciente(parsed.data.paciente_id);
    redirectComAviso(painelPath(parsed.data.paciente_id), "Plano terapêutico registrado.");
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível salvar o plano."),
    };
  }
}

export async function atualizarPlanoAction(
  _prev: ProntuarioActionState,
  formData: FormData,
): Promise<ProntuarioActionState> {
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, message: "Plano inválido." };
  const parsed = planoFormSchema.safeParse(planoFromForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  try {
    const sessao = await exigirSessao();
    await service.atualizarPlano(sessao, id, parsed.data);
    revalidatePaciente(parsed.data.paciente_id);
    redirectComAviso(painelPath(parsed.data.paciente_id), "Plano terapêutico atualizado.");
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível atualizar o plano."),
    };
  }
}

export async function excluirPlanoAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const pacienteId = String(formData.get("paciente_id") || "");
  const sessao = await exigirSessao();
  await service.excluirPlano(sessao, id, pacienteId);
  revalidatePaciente(pacienteId);
  redirectComAviso(painelPath(pacienteId), "Plano terapêutico excluído.");
}

function evolucaoFromForm(formData: FormData) {
  return {
    paciente_id: formData.get("paciente_id"),
    data_evolucao: formData.get("data_evolucao"),
    descricao: formData.get("descricao"),
    escala_dor: formData.get("escala_dor") || undefined,
    observacoes: formData.get("observacoes") || undefined,
  };
}

export async function criarEvolucaoAction(
  _prev: ProntuarioActionState,
  formData: FormData,
): Promise<ProntuarioActionState> {
  const parsed = evolucaoFormSchema.safeParse(evolucaoFromForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  try {
    const sessao = await exigirSessao();
    await service.criarEvolucao(sessao, parsed.data);
    revalidatePaciente(parsed.data.paciente_id);
    redirectComAviso(painelPath(parsed.data.paciente_id), "Evolução registrada.");
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível salvar a evolução."),
    };
  }
}

/** Mesma evolução, sem sair da tela (uso na Agenda). */
export async function criarEvolucaoRapidaAction(
  _prev: ProntuarioActionState,
  formData: FormData,
): Promise<ProntuarioActionState> {
  const parsed = evolucaoFormSchema.safeParse(evolucaoFromForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  try {
    const sessao = await exigirSessao();
    await service.criarEvolucao(sessao, parsed.data);
    revalidatePaciente(parsed.data.paciente_id);
    revalidatePath("/agenda");
    return { ok: true, message: "Evolução registrada." };
  } catch (error) {
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível salvar a evolução."),
    };
  }
}

export async function atualizarEvolucaoAction(
  _prev: ProntuarioActionState,
  formData: FormData,
): Promise<ProntuarioActionState> {
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, message: "Evolução inválida." };
  const parsed = evolucaoFormSchema.safeParse(evolucaoFromForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  try {
    const sessao = await exigirSessao();
    await service.atualizarEvolucao(sessao, id, parsed.data);
    revalidatePaciente(parsed.data.paciente_id);
    redirectComAviso(painelPath(parsed.data.paciente_id), "Evolução atualizada.");
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível atualizar a evolução."),
    };
  }
}

export async function excluirEvolucaoAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const pacienteId = String(formData.get("paciente_id") || "");
  const sessao = await exigirSessao();
  await service.excluirEvolucao(sessao, id, pacienteId);
  revalidatePaciente(pacienteId);
  redirectComAviso(painelPath(pacienteId), "Evolução excluída.");
}

export async function registrarAltaAction(
  _prev: ProntuarioActionState,
  formData: FormData,
): Promise<ProntuarioActionState> {
  const parsed = altaFormSchema.safeParse({
    paciente_id: formData.get("paciente_id"),
    data_alta: formData.get("data_alta"),
    motivo: formData.get("motivo") || undefined,
    observacoes: formData.get("observacoes") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  try {
    const sessao = await exigirSessao();
    await service.registrarAlta(sessao, parsed.data);
    revalidatePaciente(parsed.data.paciente_id);
    redirectComAviso(painelPath(parsed.data.paciente_id), "Alta registrada.");
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível registrar a alta."),
    };
  }
}

export async function reabrirTratamentoAction(
  formData: FormData,
): Promise<void> {
  const parsed = reabrirFormSchema.safeParse({
    paciente_id: formData.get("paciente_id"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Paciente inválido.");
  }
  const sessao = await exigirSessao();
  await service.reabrirTratamento(sessao, parsed.data.paciente_id);
  revalidatePaciente(parsed.data.paciente_id);
  redirectComAviso(painelPath(parsed.data.paciente_id), "Tratamento reaberto.");
}
