import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors/app-error";
import { assertPermissao } from "@/lib/auth/permissoes";
import type { SessaoUsuario } from "@/lib/auth/sessao";
import { UsuarioRepository } from "@/repositories/usuarios/usuario-repository";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AtualizarUsuarioInput,
  CriarUsuarioInput,
} from "@/lib/validations/usuario-clinica";

export class UsuarioService {
  constructor(private readonly usuarios = new UsuarioRepository()) {}

  async listar(sessao: SessaoUsuario) {
    assertPermissao(sessao.perfil, "usuarios.gerenciar");
    return this.usuarios.listar(sessao.clinicaId);
  }

  async obter(sessao: SessaoUsuario, id: string) {
    assertPermissao(sessao.perfil, "usuarios.gerenciar");
    const found = await this.usuarios.buscarPorId(sessao.clinicaId, id);
    if (!found) {
      throw new AppError("Usuário não encontrado.", "USUARIO_NOT_FOUND");
    }
    return found;
  }

  async criar(sessao: SessaoUsuario, input: CriarUsuarioInput) {
    assertPermissao(sessao.perfil, "usuarios.gerenciar");

    const existente = await this.usuarios.buscarPorEmailNaClinica(
      sessao.clinicaId,
      input.email,
    );
    if (existente) {
      throw new AppError(
        "Já existe um usuário com este e-mail nesta clínica.",
        "EMAIL_DUPLICADO",
      );
    }

    const admin = createSupabaseAdminClient();
    const created = await admin.auth.admin.createUser({
      email: input.email,
      password: input.senha!,
      email_confirm: true,
      user_metadata: { nome: input.nome },
    });

    if (created.error || !created.data.user) {
      throw new AppError(
        created.error?.message ?? "Falha ao criar usuário no Auth.",
        "AUTH_CREATE_FAILED",
      );
    }

    try {
      return await prisma.$transaction(async (tx) => {
        return this.usuarios.criar(tx, {
          clinica_id: sessao.clinicaId,
          auth_user_id: created.data.user!.id,
          nome: input.nome,
          email: input.email,
          telefone: input.telefone,
          perfil: input.perfil,
          ativo: input.ativo,
        });
      });
    } catch (error) {
      try {
        await admin.auth.admin.deleteUser(created.data.user.id);
      } catch {
        // best-effort
      }
      throw error;
    }
  }

  async atualizar(
    sessao: SessaoUsuario,
    id: string,
    input: AtualizarUsuarioInput,
  ) {
    assertPermissao(sessao.perfil, "usuarios.gerenciar");

    if (id === sessao.usuarioId && !input.ativo) {
      throw new AppError(
        "Você não pode desativar a si mesmo.",
        "AUTO_DESATIVAR",
      );
    }

    if (id === sessao.usuarioId && input.perfil !== "administrador") {
      throw new AppError(
        "Você não pode remover o próprio perfil de administrador.",
        "AUTO_PERFIL",
      );
    }

    return prisma.$transaction(async (tx) => {
      try {
        return await this.usuarios.atualizar(tx, sessao.clinicaId, id, {
          nome: input.nome,
          telefone: input.telefone ?? null,
          perfil: input.perfil,
          ativo: input.ativo,
        });
      } catch {
        throw new AppError("Usuário não encontrado.", "USUARIO_NOT_FOUND");
      }
    });
  }

  async excluir(sessao: SessaoUsuario, id: string) {
    assertPermissao(sessao.perfil, "usuarios.gerenciar");
    if (id === sessao.usuarioId) {
      throw new AppError(
        "Você não pode excluir a si mesmo.",
        "AUTO_EXCLUIR",
      );
    }

    const atual = await this.usuarios.buscarPorId(sessao.clinicaId, id);
    if (!atual) {
      throw new AppError("Usuário não encontrado.", "USUARIO_NOT_FOUND");
    }

    await prisma.$transaction(async (tx) => {
      await this.usuarios.softDelete(tx, sessao.clinicaId, id);
    });

    if (atual.auth_user_id) {
      try {
        const admin = createSupabaseAdminClient();
        await admin.auth.admin.updateUserById(atual.auth_user_id, {
          ban_duration: "876000h",
        });
      } catch {
        // metadado local já soft-deletado
      }
    }
  }
}
