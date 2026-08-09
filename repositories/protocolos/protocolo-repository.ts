import { prisma } from "@/lib/prisma";
import type { Prisma, Protocolo } from "@prisma/client";

export type ListarProtocolosFiltro = {
  clinicaId: string;
  busca?: string;
  ativo?: boolean | "todos";
  page?: number;
  pageSize?: number;
};

export type CriarProtocoloData = {
  clinica_id: string;
  nome: string;
  descricao?: string;
  objetivo?: string;
  tempo_estimado?: number;
  observacoes?: string;
  categorias?: string[];
  ativo?: boolean;
};

export type AtualizarProtocoloData = {
  nome: string;
  descricao?: string | null;
  objetivo?: string | null;
  tempo_estimado?: number | null;
  observacoes?: string | null;
  categorias: string[];
  ativo: boolean;
};

type Tx = Prisma.TransactionClient;

export class ProtocoloRepository {
  async listar(filtro: ListarProtocolosFiltro) {
    const page = Math.max(1, filtro.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, filtro.pageSize ?? 20));
    const busca = filtro.busca?.trim();

    const where: Prisma.ProtocoloWhereInput = {
      clinica_id: filtro.clinicaId,
      deleted_at: null,
      ...(filtro.ativo !== undefined && filtro.ativo !== "todos"
        ? { ativo: filtro.ativo }
        : {}),
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca, mode: "insensitive" } },
              { objetivo: { contains: busca, mode: "insensitive" } },
              { descricao: { contains: busca, mode: "insensitive" } },
              { categorias: { has: busca } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.protocolo.count({ where }),
      prisma.protocolo.findMany({
        where,
        orderBy: [{ nome: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { items, total, page, pageSize };
  }

  /** Leitura de protocolos ativos — usada por Sessões (vínculo). */
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

  async buscarPorId(
    clinicaId: string,
    id: string,
  ): Promise<Protocolo | null> {
    return prisma.protocolo.findFirst({
      where: {
        id,
        clinica_id: clinicaId,
        deleted_at: null,
      },
    });
  }

  async criar(tx: Tx, data: CriarProtocoloData): Promise<Protocolo> {
    return tx.protocolo.create({
      data: {
        clinica_id: data.clinica_id,
        nome: data.nome,
        descricao: data.descricao,
        objetivo: data.objetivo,
        tempo_estimado: data.tempo_estimado,
        observacoes: data.observacoes,
        categorias: data.categorias ?? [],
        ativo: data.ativo ?? true,
      },
    });
  }

  async atualizar(
    tx: Tx,
    clinicaId: string,
    id: string,
    data: AtualizarProtocoloData,
  ): Promise<Protocolo> {
    const existente = await tx.protocolo.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) {
      throw new Error("Protocolo não encontrado.");
    }
    return tx.protocolo.update({
      where: { id },
      data: {
        nome: data.nome,
        descricao: data.descricao,
        objetivo: data.objetivo,
        tempo_estimado: data.tempo_estimado,
        observacoes: data.observacoes,
        categorias: data.categorias,
        ativo: data.ativo,
      },
    });
  }

  async softDelete(tx: Tx, clinicaId: string, id: string): Promise<void> {
    const existente = await tx.protocolo.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) {
      throw new Error("Protocolo não encontrado.");
    }
    await tx.protocolo.update({
      where: { id },
      data: { deleted_at: new Date(), ativo: false },
    });
  }
}
