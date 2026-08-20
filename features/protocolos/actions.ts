"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/auth/sessao";
import { ProtocoloService } from "@/services/protocolos/protocolo-service";
import { protocoloFormSchema } from "@/lib/validations/protocolo";
import { mensagemDeErro } from "@/lib/errors/app-error";
import { redirectComAviso } from "@/lib/feedback/aviso";

export type ProtocoloActionState = {
  ok: boolean;
  message?: string;
};

const service = new ProtocoloService();

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
  return {
    nome: formData.get("nome"),
    descricao: formData.get("descricao") || undefined,
    objetivo: formData.get("objetivo") || undefined,
    tempo_estimado: formData.get("tempo_estimado") || undefined,
    observacoes: formData.get("observacoes") || undefined,
    categorias: formData.get("categorias") || undefined,
    ativo: formData.get("ativo") || "true",
  };
}

export async function criarProtocoloAction(
  _prev: ProtocoloActionState,
  formData: FormData,
): Promise<ProtocoloActionState> {
  const parsed = protocoloFormSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const sessao = await exigirSessao();
    const protocolo = await service.criar(sessao, parsed.data);
    revalidatePath("/protocolos");
    redirectComAviso(`/protocolos/${protocolo.id}`, "Protocolo criado.");
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível criar o protocolo."),
    };
  }
}

export async function atualizarProtocoloAction(
  _prev: ProtocoloActionState,
  formData: FormData,
): Promise<ProtocoloActionState> {
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, message: "Protocolo inválido." };

  const parsed = protocoloFormSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const sessao = await exigirSessao();
    await service.atualizar(sessao, id, parsed.data);
    revalidatePath("/protocolos");
    revalidatePath(`/protocolos/${id}`);
    redirectComAviso(`/protocolos/${id}`, "Protocolo atualizado.");
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível atualizar o protocolo."),
    };
  }
}

export async function excluirProtocoloAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const sessao = await exigirSessao();
  await service.excluir(sessao, id);
  revalidatePath("/protocolos");
  redirectComAviso("/protocolos", "Protocolo excluído.");
}
