"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/auth/sessao";
import { SessaoService } from "@/services/sessoes/sessao-service";
import { sessaoFormSchema } from "@/lib/validations/sessao";
import { mensagemDeErro } from "@/lib/errors/app-error";

export type SessaoActionState = {
  ok: boolean;
  message?: string;
};

const service = new SessaoService();

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

function formToObject(formData: FormData) {
  const protocoloIds = formData
    .getAll("protocolo_ids")
    .map(String)
    .filter(Boolean);

  return {
    paciente_id: formData.get("paciente_id"),
    profissional_id: formData.get("profissional_id"),
    realizado_em: formData.get("realizado_em"),
    procedimentos: formData.get("procedimentos") || undefined,
    equipamentos: formData.get("equipamentos") || undefined,
    escala_dor: formData.get("escala_dor") || undefined,
    observacoes: formData.get("observacoes") || undefined,
    status: formData.get("status") || "registrada",
    protocolo_ids: protocoloIds,
  };
}

export async function criarSessaoAction(
  _prev: SessaoActionState,
  formData: FormData,
): Promise<SessaoActionState> {
  const parsed = sessaoFormSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const sessaoAuth = await exigirSessao();
    const sessao = await service.criar(sessaoAuth, parsed.data);
    revalidatePath("/sessoes");
    revalidatePath(`/pacientes/${parsed.data.paciente_id}`);
    redirect(`/sessoes/${sessao.id}`);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível registrar a sessão."),
    };
  }
}

export async function atualizarSessaoAction(
  _prev: SessaoActionState,
  formData: FormData,
): Promise<SessaoActionState> {
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, message: "Sessão inválida." };

  const parsed = sessaoFormSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const sessaoAuth = await exigirSessao();
    await service.atualizar(sessaoAuth, id, parsed.data);
    revalidatePath("/sessoes");
    revalidatePath(`/sessoes/${id}`);
    revalidatePath(`/pacientes/${parsed.data.paciente_id}`);
    redirect(`/sessoes/${id}`);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível atualizar a sessão."),
    };
  }
}

export async function excluirSessaoAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const pacienteId = String(formData.get("paciente_id") || "");
  const sessaoAuth = await exigirSessao();
  await service.excluir(sessaoAuth, id);
  revalidatePath("/sessoes");
  if (pacienteId) revalidatePath(`/pacientes/${pacienteId}`);
  redirect("/sessoes");
}
