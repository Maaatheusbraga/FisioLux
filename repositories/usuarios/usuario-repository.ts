import { prisma } from "@/lib/prisma";
import type { Usuario } from "@prisma/client";

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
}
