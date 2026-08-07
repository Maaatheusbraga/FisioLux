"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/auth/sessao";
import { PacienteService } from "@/services/pacientes/paciente-service";
import { pacienteFormSchema } from "@/lib/validations/paciente";
import { mensagemDeErro } from "@/lib/errors/app-error";

export type PacienteActionState = {
  ok: boolean;
  message?: string;
};

const service = new PacienteService();

function formToObject(formData: FormData) {
  return {
    nome: formData.get("nome"),
    cpf: formData.get("cpf"),
    rg: formData.get("rg") || undefined,
    sexo: formData.get("sexo") || "nao_informado",
    data_nascimento: formData.get("data_nascimento"),
    telefone: formData.get("telefone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || undefined,
    endereco: formData.get("endereco") || undefined,
    observacoes: formData.get("observacoes") || undefined,
    diagnostico: formData.get("diagnostico") || undefined,
    medicamentos: formData.get("medicamentos") || undefined,
    alergias: formData.get("alergias") || undefined,
    historico_medico: formData.get("historico_medico") || undefined,
    objetivo_tratamento: formData.get("objetivo_tratamento") || undefined,
    contato_emergencia_nome: formData.get("contato_emergencia_nome") || undefined,
    contato_emergencia_telefone:
      formData.get("contato_emergencia_telefone") || undefined,
    contato_emergencia_parentesco:
      formData.get("contato_emergencia_parentesco") || undefined,
    status: formData.get("status") || "em_tratamento",
  };
}

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export type PacienteBuscaItem = {
  id: string;
  nome: string;
  cpf: string;
};

/** Busca pacientes por nome/CPF/telefone (LIKE) — para selects que não escalam. */
export async function buscarPacientesAction(
  termo: string,
): Promise<PacienteBuscaItem[]> {
  const q = termo.trim();
  if (q.length < 2) return [];

  const sessao = await exigirSessao();
  const resultado = await service.listar(sessao, {
    busca: q,
    status: "todos",
    page: 1,
    pageSize: 15,
  });

  return resultado.items.map((p) => ({
    id: p.id,
    nome: p.nome,
    cpf: p.cpf,
  }));
}

export async function criarPacienteAction(
  _prev: PacienteActionState,
  formData: FormData,
): Promise<PacienteActionState> {
  const parsed = pacienteFormSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const sessao = await exigirSessao();
    const paciente = await service.criar(sessao, parsed.data);
    revalidatePath("/pacientes");
    redirect(`/pacientes/${paciente.id}`);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível cadastrar o paciente."),
    };
  }
}

export async function atualizarPacienteAction(
  _prev: PacienteActionState,
  formData: FormData,
): Promise<PacienteActionState> {
  const id = String(formData.get("id") || "");
  if (!id) {
    return { ok: false, message: "Paciente inválido." };
  }

  const parsed = pacienteFormSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const sessao = await exigirSessao();
    await service.atualizar(sessao, id, parsed.data);
    revalidatePath("/pacientes");
    revalidatePath(`/pacientes/${id}`);
    redirect(`/pacientes/${id}`);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível atualizar o paciente."),
    };
  }
}

export async function excluirPacienteAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const sessao = await exigirSessao();
  await service.excluir(sessao, id);
  revalidatePath("/pacientes");
  redirect("/pacientes");
}
