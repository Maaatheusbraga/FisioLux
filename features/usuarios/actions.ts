"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/auth/sessao";
import { UsuarioService } from "@/services/usuarios/usuario-service";
import {
  atualizarUsuarioSchema,
  criarUsuarioSchema,
} from "@/lib/validations/usuario-clinica";
import { mensagemDeErro } from "@/lib/errors/app-error";
import { redirectComAviso } from "@/lib/feedback/aviso";

export type UsuarioActionState = {
  ok: boolean;
  message?: string;
};

const service = new UsuarioService();

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
    email: formData.get("email"),
    telefone: formData.get("telefone") || undefined,
    perfil: formData.get("perfil"),
    ativo: formData.get("ativo") || "true",
    senha: formData.get("senha") || undefined,
  };
}

export async function criarUsuarioAction(
  _prev: UsuarioActionState,
  formData: FormData,
): Promise<UsuarioActionState> {
  const parsed = criarUsuarioSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const sessao = await exigirSessao();
    const usuario = await service.criar(sessao, parsed.data);
    revalidatePath("/usuarios");
    redirectComAviso(`/usuarios/${usuario.id}`, "Usuário criado.");
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível criar o usuário."),
    };
  }
}

export async function atualizarUsuarioAction(
  _prev: UsuarioActionState,
  formData: FormData,
): Promise<UsuarioActionState> {
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, message: "Usuário inválido." };

  const parsed = atualizarUsuarioSchema.safeParse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone") || undefined,
    perfil: formData.get("perfil"),
    ativo: formData.get("ativo") || "true",
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const sessao = await exigirSessao();
    await service.atualizar(sessao, id, parsed.data);
    revalidatePath("/usuarios");
    revalidatePath(`/usuarios/${id}`);
    redirectComAviso(`/usuarios/${id}`, "Usuário atualizado.");
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível atualizar o usuário."),
    };
  }
}

export async function excluirUsuarioAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const sessao = await exigirSessao();
  await service.excluir(sessao, id);
  revalidatePath("/usuarios");
  redirectComAviso("/usuarios", "Usuário excluído.");
}
