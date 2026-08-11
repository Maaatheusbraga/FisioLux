import { prisma } from "@/lib/prisma";
import type { Prisma, categoria_arquivo } from "@prisma/client";

export type ListarArquivosFiltro = {
  clinicaId: string;
  pacienteId?: string;
  sessaoId?: string;
  categorias?: categoria_arquivo[];
  page?: number;
  pageSize?: number;
  incluirExcluidos?: boolean;
};

type Tx = Prisma.TransactionClient;

export class ArquivoRepository {
  async listar(filtro: ListarArquivosFiltro) {
    const page = Math.max(1, filtro.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, filtro.pageSize ?? 20));

    const where: Prisma.ArquivoWhereInput = {
      clinica_id: filtro.clinicaId,
      ...(filtro.incluirExcluidos ? {} : { deleted_at: null }),
      ...(filtro.pacienteId ? { paciente_id: filtro.pacienteId } : {}),
      ...(filtro.sessaoId ? { sessao_id: filtro.sessaoId } : {}),
      ...(filtro.categorias && filtro.categorias.length > 0
        ? { categoria: { in: filtro.categorias } }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.arquivo.count({ where }),
      prisma.arquivo.findMany({
        where,
        include: {
          paciente: { select: { id: true, nome: true } },
          usuario: { select: { id: true, nome: true } },
          sessao: {
            select: { id: true, realizado_em: true },
          },
        },
        orderBy: { data_upload: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { items, total, page, pageSize };
  }

  async buscarPorId(clinicaId: string, id: string) {
    return prisma.arquivo.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
      include: {
        paciente: { select: { id: true, nome: true } },
        usuario: { select: { id: true, nome: true } },
        sessao: { select: { id: true, realizado_em: true } },
      },
    });
  }

  async criar(
    tx: Tx,
    data: Prisma.ArquivoUncheckedCreateInput,
  ) {
    return tx.arquivo.create({ data });
  }

  async softDelete(
    tx: Tx,
    clinicaId: string,
    id: string,
    novaStorageKey: string,
  ) {
    const existente = await tx.arquivo.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) {
      throw new Error("Arquivo não encontrado.");
    }

    return tx.arquivo.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        storage_key: novaStorageKey,
      },
    });
  }
}
