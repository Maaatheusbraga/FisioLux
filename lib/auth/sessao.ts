import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UsuarioRepository } from "@/repositories/usuarios/usuario-repository";
import { AppError } from "@/lib/errors/app-error";
import type { PerfilUsuario } from "@/types/dominio";

export type SessaoUsuario = {
  authUserId: string;
  usuarioId: string;
  clinicaId: string;
  email: string;
  nome: string;
  perfil: PerfilUsuario;
};

const usuarioRepository = new UsuarioRepository();

/**
 * Resolve a sessão autenticada + registro `usuarios` da clínica.
 * Retorna null se não houver Auth ou vínculo ativo no banco.
 */
export async function obterSessaoAtual(): Promise<SessaoUsuario | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const usuario = await usuarioRepository.buscarPorAuthUserId(user.id);
  if (!usuario) {
    return null;
  }

  return {
    authUserId: user.id,
    usuarioId: usuario.id,
    clinicaId: usuario.clinica_id,
    email: usuario.email,
    nome: usuario.nome,
    perfil: usuario.perfil as PerfilUsuario,
  };
}

/**
 * Exige sessão válida. Use em Server Actions / pages protegidas.
 */
export async function exigirSessao(): Promise<SessaoUsuario> {
  const sessao = await obterSessaoAtual();
  if (!sessao) {
    throw new AppError(
      "Sessão expirada. Entre novamente.",
      "AUTH_REQUIRED",
    );
  }
  return sessao;
}
