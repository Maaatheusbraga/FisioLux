import { prisma } from "@/lib/prisma";
import type { Prisma, status_sessao } from "@prisma/client";

export type ListarSessoesFiltro = {
  clinicaId: string;
  pacienteId?: string;
  profissionalId?: string;
  status?: status_sessao | "todos";
  page?: number;
  pageSize?: number;
};

type Tx = Prisma.TransactionClient;

export class SessaoRepository {
  async listar(filtro: ListarSessoesFiltro) {
    const page = Math.max(1, filtro.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, filtro.pageSize ?? 20));

    const where: Prisma.SessaoWhereInput = {
      clinica_id: filtro.clinicaId,
      deleted_at: null,
      ...(filtro.pacienteId ? { paciente_id: filtro.pacienteId } : {}),
      ...(filtro.profissionalId
        ? { profissional_id: filtro.profissionalId }
        : {}),
      ...(filtro.status && filtro.status !== "todos"
        ? { status: filtro.status }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.sessao.count({ where }),
      prisma.sessao.findMany({
        where,
        include: {
          paciente: { select: { id: true, nome: true } },
          profissional: { select: { id: true, nome: true } },
          protocolos: {
            include: {
              protocolo: { select: { id: true, nome: true } },
            },
          },
        },
        orderBy: { realizado_em: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { items, total, page, pageSize };
  }

  async buscarPorId(clinicaId: string, id: string) {
    return prisma.sessao.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
      include: {
        paciente: { select: { id: true, nome: true, status: true } },
        profissional: { select: { id: true, nome: true, perfil: true } },
        protocolos: {
          include: {
            protocolo: {
              select: { id: true, nome: true, tempo_estimado: true },
            },
          },
        },
        arquivos: {
          where: { deleted_at: null },
          select: {
            id: true,
            categoria: true,
            descricao: true,
            nome_original: true,
            mime_type: true,
          },
          take: 20,
        },
      },
    });
  }

  async criar(
    tx: Tx,
    data: Prisma.SessaoUncheckedCreateInput,
    protocoloIds: string[],
  ) {
    const sessao = await tx.sessao.create({ data });
    if (protocoloIds.length > 0) {
      await tx.sessaoProtocolo.createMany({
        data: protocoloIds.map((protocolo_id) => ({
          sessao_id: sessao.id,
          protocolo_id,
        })),
      });
    }
    return sessao;
  }

  async atualizar(
    tx: Tx,
    clinicaId: string,
    id: string,
    data: Prisma.SessaoUncheckedUpdateInput,
    protocoloIds: string[],
  ) {
    const existente = await tx.sessao.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) {
      throw new Error("Sessão não encontrada.");
    }

    await tx.sessaoProtocolo.deleteMany({ where: { sessao_id: id } });
    if (protocoloIds.length > 0) {
      await tx.sessaoProtocolo.createMany({
        data: protocoloIds.map((protocolo_id) => ({
          sessao_id: id,
          protocolo_id,
        })),
      });
    }

    return tx.sessao.update({
      where: { id },
      data,
    });
  }

  async softDelete(tx: Tx, clinicaId: string, id: string) {
    const existente = await tx.sessao.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) {
      throw new Error("Sessão não encontrada.");
    }
    return tx.sessao.update({
      where: { id },
      data: { deleted_at: new Date(), status: "cancelada" },
    });
  }
}
