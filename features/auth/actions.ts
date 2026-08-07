"use server";

import { redirect } from "next/navigation";
import { AuthService } from "@/services/auth/auth-service";
import {
  loginSchema,
  recuperarSenhaSchema,
  redefinirSenhaSchema,
} from "@/lib/validations/auth";
import { mensagemDeErro } from "@/lib/errors/app-error";

export type AuthActionState = {
  ok: boolean;
  message?: string;
};

const authService = new AuthService();

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    await authService.login(parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: mensagemDeErro(error, "Falha ao entrar."),
    };
  }

  const redirectTo = String(formData.get("redirect") || "/dashboard");
  redirect(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
}

export async function logoutAction(): Promise<void> {
  await authService.logout();
  redirect("/login");
}

export async function recuperarSenhaAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = recuperarSenhaSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "E-mail inválido.",
    };
  }

  try {
    await authService.solicitarRecuperacaoSenha(parsed.data);
    return {
      ok: true,
      message:
        "Se o e-mail estiver cadastrado, você receberá as instruções em breve.",
    };
  } catch (error) {
    return {
      ok: false,
      message: mensagemDeErro(error, "Falha ao solicitar recuperação."),
    };
  }
}

export async function redefinirSenhaAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = redefinirSenhaSchema.safeParse({
    senha: formData.get("senha"),
    confirmarSenha: formData.get("confirmarSenha"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    await authService.redefinirSenha(parsed.data.senha);
  } catch (error) {
    return {
      ok: false,
      message: mensagemDeErro(error, "Falha ao redefinir senha."),
    };
  }

  redirect("/login?reset=1");
}
