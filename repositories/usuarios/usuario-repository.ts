import { prisma } from "@/lib/prisma";
import type { Prisma, Usuario, perfil_usuario } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export class UsuarioRepository {
  async buscarPorAuthUserId(authUserId: string): Promise<Usuario | null> {
    return prisma.usuario.findFirst({
      where: {
        auth_user_id: authUserId,
        deleted_at: null,
        ativo: true,
      },
    });
  }

  async buscarPorEmailNaClinica(
    clinicaId: string,
    email: string,
  ): Promise<Usuario | null> {
    return prisma.usuario.findFirst({
      where: {
        clinica_id: clinicaId,
        email: email.toLowerCase(),
        deleted_at: null,
      },
    });
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findFirst({
      where: {
        email: email.toLowerCase(),
        deleted_at: null,
        ativo: true,
      },
    });
  }

  async vincularAuthUserId(
    usuarioId: string,
    authUserId: string,
  ): Promise<Usuario> {
    return prisma.usuario.update({
      where: { id: usuarioId },
      data: { auth_user_id: authUserId },
    });
  }

  async listar(clinicaId: string) {
    return prisma.usuario.findMany({
      where: { clinica_id: clinicaId, deleted_at: null },
      orderBy: [{ ativo: "desc" }, { nome: "asc" }],
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        perfil: true,
        ativo: true,
        auth_user_id: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async buscarPorId(clinicaId: string, id: string) {
    return prisma.usuario.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
  }

  async criar(
    tx: Tx,
    data: {
      clinica_id: string;
      auth_user_id: string;
      nome: string;
      email: string;
      telefone?: string | null;
      perfil: perfil_usuario;
      ativo?: boolean;
    },
  ) {
    return tx.usuario.create({
      data: {
        clinica_id: data.clinica_id,
        auth_user_id: data.auth_user_id,
        nome: data.nome,
        email: data.email.toLowerCase(),
        telefone: data.telefone,
        perfil: data.perfil,
        ativo: data.ativo ?? true,
      },
    });
  }

  async atualizar(
    tx: Tx,
    clinicaId: string,
    id: string,
    data: {
      nome: string;
      telefone?: string | null;
      perfil: perfil_usuario;
      ativo: boolean;
    },
  ) {
    const existente = await tx.usuario.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) throw new Error("Usuário não encontrado.");
    return tx.usuario.update({
      where: { id },
      data: {
        nome: data.nome,
        telefone: data.telefone,
        perfil: data.perfil,
        ativo: data.ativo,
      },
    });
  }

  async softDelete(tx: Tx, clinicaId: string, id: string) {
    const existente = await tx.usuario.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) throw new Error("Usuário não encontrado.");
    return tx.usuario.update({
      where: { id },
      data: { deleted_at: new Date(), ativo: false },
    });
  }
}
