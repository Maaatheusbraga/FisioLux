import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UsuarioRepository } from "@/repositories/usuarios/usuario-repository";
import { AppError } from "@/lib/errors/app-error";
import type { LoginInput, RecuperarSenhaInput } from "@/lib/validations/auth";
import type { SessaoUsuario } from "@/lib/auth/sessao";
import type { PerfilUsuario } from "@/types/dominio";

function appUrl() {
  return (
    process.env.APP_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export class AuthService {
  constructor(private readonly usuarios = new UsuarioRepository()) {}

  async login(input: LoginInput): Promise<SessaoUsuario> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.senha,
    });

    if (error || !data.user) {
      throw new AppError(
        "E-mail ou senha inválidos.",
        "AUTH_INVALID_CREDENTIALS",
      );
    }

    const usuario = await this.usuarios.buscarPorAuthUserId(data.user.id);
    if (!usuario) {
      await supabase.auth.signOut();
      throw new AppError(
        "Usuário autenticado sem vínculo ativo na clínica. Contate o administrador.",
        "AUTH_SEM_VINCULO",
      );
    }

    return {
      authUserId: data.user.id,
      usuarioId: usuario.id,
      clinicaId: usuario.clinica_id,
      email: usuario.email,
      nome: usuario.nome,
      perfil: usuario.perfil as PerfilUsuario,
    };
  }

  async logout(): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new AppError("Não foi possível encerrar a sessão.", "AUTH_LOGOUT");
    }
  }

  async solicitarRecuperacaoSenha(input: RecuperarSenhaInput): Promise<void> {
    const supabase = await createSupabaseServerClient();

    // Resposta genérica: não revela se o e-mail existe.
    const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: `${appUrl()}/callback?next=/redefinir-senha`,
    });

    if (error) {
      throw new AppError(
        "Não foi possível enviar o e-mail de recuperação. Tente novamente.",
        "AUTH_RESET_EMAIL",
      );
    }
  }

  async redefinirSenha(novaSenha: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AppError(
        "Sessão de recuperação inválida ou expirada.",
        "AUTH_RESET_SESSION",
      );
    }

    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) {
      throw new AppError(
        "Não foi possível atualizar a senha.",
        "AUTH_RESET_UPDATE",
      );
    }
  }
}
