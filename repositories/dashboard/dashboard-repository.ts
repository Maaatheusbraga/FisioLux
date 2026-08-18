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
  atendimentosPorDia: { dia: string; total: number }[];
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
      sessoesPeriodo,
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
          realizado_em: { gte: ha30 },
        },
        select: { realizado_em: true },
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

    const dias: { dia: string; total: number }[] = [];
    for (let i = 29; i >= 0; i -= 1) {
      const d = new Date(agora);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const chave = d.toISOString().slice(0, 10);
      dias.push({ dia: chave, total: 0 });
    }
    const indice = new Map(dias.map((x, i) => [x.dia, i]));
    for (const s of sessoesPeriodo) {
      const chave = new Date(s.realizado_em).toISOString().slice(0, 10);
      const i = indice.get(chave);
      if (i != null) dias[i]!.total += 1;
    }

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
      atendimentosPorDia: dias,
      sessoesRecentes,
      pacientesRecentes,
    };
  }
}
