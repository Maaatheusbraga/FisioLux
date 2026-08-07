import { prisma } from "@/lib/prisma";
import type { Prisma, tipo_evento_timeline } from "@prisma/client";

export type CriarEventoTimelineInput = {
  clinicaId: string;
  pacienteId: string;
  usuarioId: string;
  tipo: tipo_evento_timeline;
  descricao: string;
  ocorridoEm?: Date;
  metadados?: Prisma.InputJsonValue;
  arquivoId?: string;
  sessaoId?: string;
};

export type ListarTimelineFiltro = {
  clinicaId: string;
  pacienteId: string;
  tiposPermitidos?: tipo_evento_timeline[];
  tipo?: tipo_evento_timeline | "todos";
  usuarioId?: string | "todos";
  de?: Date;
  ate?: Date;
  page?: number;
  pageSize?: number;
};

type Tx = Prisma.TransactionClient;

export class TimelineRepository {
  async criar(tx: Tx, input: CriarEventoTimelineInput) {
    return tx.timelineEvento.create({
      data: {
        clinica_id: input.clinicaId,
        paciente_id: input.pacienteId,
        usuario_id: input.usuarioId,
        tipo: input.tipo,
        descricao: input.descricao,
        ocorrido_em: input.ocorridoEm ?? new Date(),
        metadados: input.metadados,
        arquivo_id: input.arquivoId,
        sessao_id: input.sessaoId,
      },
    });
  }

  async listarPorPaciente(filtro: ListarTimelineFiltro) {
    const page = Math.max(1, filtro.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filtro.pageSize ?? 40));

    const where: Prisma.TimelineEventoWhereInput = {
      clinica_id: filtro.clinicaId,
      paciente_id: filtro.pacienteId,
      ...(filtro.tiposPermitidos?.length
        ? { tipo: { in: filtro.tiposPermitidos } }
        : {}),
      ...(filtro.tipo && filtro.tipo !== "todos"
        ? { tipo: filtro.tipo }
        : {}),
      ...(filtro.usuarioId && filtro.usuarioId !== "todos"
        ? { usuario_id: filtro.usuarioId }
        : {}),
      ...(filtro.de || filtro.ate
        ? {
            ocorrido_em: {
              ...(filtro.de ? { gte: filtro.de } : {}),
              ...(filtro.ate ? { lte: filtro.ate } : {}),
            },
          }
        : {}),
    };

    // Se tipo específico e tiposPermitidos, garantir interseção
    if (
      filtro.tipo &&
      filtro.tipo !== "todos" &&
      filtro.tiposPermitidos?.length &&
      !filtro.tiposPermitidos.includes(filtro.tipo)
    ) {
      return { items: [], total: 0, page, pageSize };
    }

    const [total, items] = await Promise.all([
      prisma.timelineEvento.count({ where }),
      prisma.timelineEvento.findMany({
        where,
        include: {
          usuario: {
            select: { id: true, nome: true, perfil: true },
          },
          arquivo: {
            select: {
              id: true,
              categoria: true,
              descricao: true,
              nome_original: true,
              mime_type: true,
              deleted_at: true,
            },
          },
        },
        orderBy: [{ ocorrido_em: "desc" }, { created_at: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { items, total, page, pageSize };
  }
}
