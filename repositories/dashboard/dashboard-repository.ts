import { prisma } from "@/lib/prisma";

export type DashboardResumo = {
  pacientesEmTratamento: number;
  pacientesAlta: number;
  pacientesTotal: number;
  sessoesRegistradas30d: number;
  sessoesCanceladas30d: number;
  sessoesTotal: number;
  protocolosAtivos: number;
  documentosAtivos: number;
  midiasAtivas: number;
  eventosTimeline7d: number;
  sessoesRecentes: {
    id: string;
    realizado_em: Date;
    paciente: { id: string; nome: string };
    profissional: { id: string; nome: string };
  }[];
  pacientesRecentes: {
    id: string;
    nome: string;
    status: string;
    created_at: Date;
  }[];
};

export class DashboardRepository {
  async obterResumo(clinicaId: string): Promise<DashboardResumo> {
    const agora = new Date();
    const ha30 = new Date(agora);
    ha30.setDate(ha30.getDate() - 30);
    const ha7 = new Date(agora);
    ha7.setDate(ha7.getDate() - 7);

    const categoriasDoc = [
      "encaminhamento",
      "relatorio_medico",
      "laudo",
      "receita",
      "documento",
    ] as const;
    const categoriasMidia = [
      "foto_evolucao",
      "foto_antes",
      "foto_depois",
      "video",
    ] as const;

    const [
      pacientesEmTratamento,
      pacientesAlta,
      pacientesTotal,
      sessoesRegistradas30d,
      sessoesCanceladas30d,
      sessoesTotal,
      protocolosAtivos,
      documentosAtivos,
      midiasAtivas,
      eventosTimeline7d,
      sessoesRecentes,
      pacientesRecentes,
    ] = await Promise.all([
      prisma.paciente.count({
        where: {
          clinica_id: clinicaId,
          deleted_at: null,
          status: "em_tratamento",
        },
      }),
      prisma.paciente.count({
        where: {
          clinica_id: clinicaId,
          deleted_at: null,
          status: "alta",
        },
      }),
      prisma.paciente.count({
        where: { clinica_id: clinicaId, deleted_at: null },
      }),
      prisma.sessao.count({
        where: {
          clinica_id: clinicaId,
          deleted_at: null,
          status: "registrada",
          realizado_em: { gte: ha30 },
        },
      }),
      prisma.sessao.count({
        where: {
          clinica_id: clinicaId,
          deleted_at: null,
          status: "cancelada",
          realizado_em: { gte: ha30 },
        },
      }),
      prisma.sessao.count({
        where: { clinica_id: clinicaId, deleted_at: null },
      }),
      prisma.protocolo.count({
        where: { clinica_id: clinicaId, deleted_at: null, ativo: true },
      }),
      prisma.arquivo.count({
        where: {
          clinica_id: clinicaId,
          deleted_at: null,
          categoria: { in: [...categoriasDoc] },
        },
      }),
      prisma.arquivo.count({
        where: {
          clinica_id: clinicaId,
          deleted_at: null,
          categoria: { in: [...categoriasMidia] },
        },
      }),
      prisma.timelineEvento.count({
        where: {
          clinica_id: clinicaId,
          ocorrido_em: { gte: ha7 },
        },
      }),
      prisma.sessao.findMany({
        where: {
          clinica_id: clinicaId,
          deleted_at: null,
          status: "registrada",
        },
        orderBy: { realizado_em: "desc" },
        take: 8,
        select: {
          id: true,
          realizado_em: true,
          paciente: { select: { id: true, nome: true } },
          profissional: { select: { id: true, nome: true } },
        },
      }),
      prisma.paciente.findMany({
        where: { clinica_id: clinicaId, deleted_at: null },
        orderBy: { created_at: "desc" },
        take: 8,
        select: {
          id: true,
          nome: true,
          status: true,
          created_at: true,
        },
      }),
    ]);

    return {
      pacientesEmTratamento,
      pacientesAlta,
      pacientesTotal,
      sessoesRegistradas30d,
      sessoesCanceladas30d,
      sessoesTotal,
      protocolosAtivos,
      documentosAtivos,
      midiasAtivas,
      eventosTimeline7d,
      sessoesRecentes,
      pacientesRecentes,
    };
  }
}
