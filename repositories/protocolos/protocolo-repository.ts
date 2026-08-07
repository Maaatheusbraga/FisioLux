import { prisma } from "@/lib/prisma";

/** Leitura de protocolos ativos — CRUD completo na Fase 8. */
export class ProtocoloRepository {
  async listarAtivos(clinicaId: string) {
    return prisma.protocolo.findMany({
      where: {
        clinica_id: clinicaId,
        deleted_at: null,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        tempo_estimado: true,
        categorias: true,
      },
      orderBy: { nome: "asc" },
    });
  }

  async validarIdsDaClinica(clinicaId: string, ids: string[]) {
    if (ids.length === 0) return true;
    const count = await prisma.protocolo.count({
      where: {
        clinica_id: clinicaId,
        id: { in: ids },
        deleted_at: null,
        ativo: true,
      },
    });
    return count === ids.length;
  }
}
