import { prisma } from "@/lib/prisma";

export type DashboardResumo = {
  pacientesEmTratamento: number;
  pacientesAlta: number;
  pacientesTotal: number;
  evolucoes30d: number;
  protocolosAtivos: number;
  documentosAtivos: number;
  midiasAtivas: number;
  eventosTimeline7d: number;
  evolucoesPorDia: { dia: string; total: number }[];
  evolucoesRecentes: {
    id: string;
    data_evolucao: Date;
    paciente: { id: string; nome: string };
    usuario: { id: string; nome: string };
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
      evolucoes30d,
      protocolosAtivos,
      documentosAtivos,
      midiasAtivas,
      eventosTimeline7d,
      evolucoesPeriodo,
      evolucoesRecentes,
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
      prisma.evolucao.count({
        where: {
          clinica_id: clinicaId,
          deleted_at: null,
          data_evolucao: { gte: ha30 },
        },
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
      prisma.$queryRaw<Array<{ dia: string; total: bigint }>>`
        SELECT to_char(e.data_evolucao, 'YYYY-MM-DD') AS dia,
               COUNT(*)::bigint AS total
        FROM evolucoes e
        WHERE e.clinica_id = ${clinicaId}::uuid
          AND e.deleted_at IS NULL
          AND e.data_evolucao >= ${ha30}
        GROUP BY 1
      `,
      prisma.evolucao.findMany({
        where: {
          clinica_id: clinicaId,
          deleted_at: null,
        },
        orderBy: [{ data_evolucao: "desc" }, { created_at: "desc" }],
        take: 8,
        select: {
          id: true,
          data_evolucao: true,
          paciente: { select: { id: true, nome: true } },
          usuario: { select: { id: true, nome: true } },
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
    for (const e of evolucoesPeriodo) {
      const i = indice.get(e.dia);
      if (i != null) dias[i]!.total = Number(e.total);
    }

    return {
      pacientesEmTratamento,
      pacientesAlta,
      pacientesTotal,
      evolucoes30d,
      protocolosAtivos,
      documentosAtivos,
      midiasAtivas,
      eventosTimeline7d,
      evolucoesPorDia: dias,
      evolucoesRecentes,
      pacientesRecentes,
    };
  }
}
