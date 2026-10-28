import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type {
  Alta,
  Anamnese,
  Avaliacao,
  Evolucao,
  PlanoTerapeutico,
  tipo_avaliacao,
} from "@prisma/client";

type Tx = Prisma.TransactionClient;

export class ProntuarioRepository {
  async listarPorPaciente(
    clinicaId: string,
    pacienteId: string,
    opts: { limiteEvolucoes?: number } = {},
  ) {
    const whereBase = {
      clinica_id: clinicaId,
      paciente_id: pacienteId,
      deleted_at: null,
    } as const;

    const [avaliacoes, planos, evolucoes, altas] = await Promise.all([
      prisma.avaliacao.findMany({
        where: whereBase,
        select: {
          id: true,
          tipo: true,
          data_avaliacao: true,
          queixa_principal: true,
          exame_fisico: true,
          diagnostico_fisioterapeutico: true,
          objetivos: true,
          observacoes: true,
          dados_complementares: true,
          usuario: { select: { id: true, nome: true } },
        },
        orderBy: [{ data_avaliacao: "desc" }, { created_at: "desc" }],
      }),
      prisma.planoTerapeutico.findMany({
        where: whereBase,
        select: {
          id: true,
          data_plano: true,
          objetivos: true,
          condutas: true,
          frequencia_sugerida: true,
          previsao_sessoes: true,
          observacoes: true,
          usuario: { select: { id: true, nome: true } },
        },
        orderBy: [{ data_plano: "desc" }, { created_at: "desc" }],
      }),
      prisma.evolucao.findMany({
        where: whereBase,
        select: {
          id: true,
          data_evolucao: true,
          descricao: true,
          escala_dor: true,
          observacoes: true,
          usuario: { select: { id: true, nome: true } },
          sessao: { select: { id: true, realizado_em: true } },
        },
        orderBy: [{ data_evolucao: "desc" }, { created_at: "desc" }],
        take: opts.limiteEvolucoes,
      }),
      prisma.alta.findMany({
        where: {
          clinica_id: clinicaId,
          paciente_id: pacienteId,
          deleted_at: null,
        },
        select: {
          id: true,
          data_alta: true,
          motivo: true,
          observacoes: true,
          data_reabertura: true,
          usuario: { select: { id: true, nome: true } },
        },
        orderBy: [{ data_alta: "desc" }, { created_at: "desc" }],
      }),
    ]);

    return { avaliacoes, planos, evolucoes, altas };
  }

  // ── Anamnese ──────────────────────────────────────────

  async buscarAnamnese(clinicaId: string, id: string): Promise<Anamnese | null> {
    return prisma.anamnese.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
  }

  async criarAnamnese(
    tx: Tx,
    data: {
      clinica_id: string;
      paciente_id: string;
      usuario_id: string;
      data_anamnese: Date;
      queixa_principal?: string;
      historia_doenca_atual?: string;
      historico_familiar?: string;
      historico_social?: string;
      habitos_vida?: string;
      exames_complementares?: string;
      observacoes?: string;
    },
  ): Promise<Anamnese> {
    return tx.anamnese.create({ data });
  }

  async atualizarAnamnese(
    tx: Tx,
    clinicaId: string,
    id: string,
    data: {
      data_anamnese: Date;
      queixa_principal?: string | null;
      historia_doenca_atual?: string | null;
      historico_familiar?: string | null;
      historico_social?: string | null;
      habitos_vida?: string | null;
      exames_complementares?: string | null;
      observacoes?: string | null;
    },
  ): Promise<Anamnese> {
    const existente = await tx.anamnese.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) throw new Error("Anamnese não encontrada.");
    return tx.anamnese.update({ where: { id }, data });
  }

  async softDeleteAnamnese(tx: Tx, clinicaId: string, id: string) {
    const existente = await tx.anamnese.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) throw new Error("Anamnese não encontrada.");
    return tx.anamnese.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  // ── Avaliação ─────────────────────────────────────────

  async buscarAvaliacao(clinicaId: string, id: string) {
    return prisma.avaliacao.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
  }

  async criarAvaliacao(
    tx: Tx,
    data: {
      clinica_id: string;
      paciente_id: string;
      usuario_id: string;
      tipo: tipo_avaliacao;
      data_avaliacao: Date;
      queixa_principal?: string;
      exame_fisico?: string;
      diagnostico_fisioterapeutico?: string;
      objetivos?: string;
      observacoes?: string;
      dados_complementares?: Prisma.InputJsonValue;
    },
  ): Promise<Avaliacao> {
    return tx.avaliacao.create({ data });
  }

  async atualizarAvaliacao(
    tx: Tx,
    clinicaId: string,
    id: string,
    data: {
      tipo: tipo_avaliacao;
      data_avaliacao: Date;
      queixa_principal?: string | null;
      exame_fisico?: string | null;
      diagnostico_fisioterapeutico?: string | null;
      objetivos?: string | null;
      observacoes?: string | null;
      dados_complementares?: Prisma.InputJsonValue | null;
    },
  ): Promise<Avaliacao> {
    const existente = await tx.avaliacao.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) throw new Error("Avaliação não encontrada.");
    const { dados_complementares, ...rest } = data;
    return tx.avaliacao.update({
      where: { id },
      data: {
        ...rest,
        ...(dados_complementares === undefined
          ? {}
          : {
              dados_complementares:
                dados_complementares === null
                  ? Prisma.DbNull
                  : dados_complementares,
            }),
      },
    });
  }

  async softDeleteAvaliacao(tx: Tx, clinicaId: string, id: string) {
    const existente = await tx.avaliacao.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) throw new Error("Avaliação não encontrada.");
    return tx.avaliacao.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  // ── Plano ─────────────────────────────────────────────

  async buscarPlano(clinicaId: string, id: string) {
    return prisma.planoTerapeutico.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
  }

  async criarPlano(
    tx: Tx,
    data: {
      clinica_id: string;
      paciente_id: string;
      usuario_id: string;
      data_plano: Date;
      objetivos?: string;
      condutas?: string;
      frequencia_sugerida?: string;
      previsao_sessoes?: number;
      observacoes?: string;
    },
  ): Promise<PlanoTerapeutico> {
    return tx.planoTerapeutico.create({ data });
  }

  async atualizarPlano(
    tx: Tx,
    clinicaId: string,
    id: string,
    data: {
      data_plano: Date;
      objetivos?: string | null;
      condutas?: string | null;
      frequencia_sugerida?: string | null;
      previsao_sessoes?: number | null;
      observacoes?: string | null;
    },
  ): Promise<PlanoTerapeutico> {
    const existente = await tx.planoTerapeutico.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) throw new Error("Plano terapêutico não encontrado.");
    return tx.planoTerapeutico.update({ where: { id }, data });
  }

  async softDeletePlano(tx: Tx, clinicaId: string, id: string) {
    const existente = await tx.planoTerapeutico.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) throw new Error("Plano terapêutico não encontrado.");
    return tx.planoTerapeutico.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  // ── Evolução ──────────────────────────────────────────

  async buscarEvolucao(clinicaId: string, id: string) {
    return prisma.evolucao.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
  }

  async criarEvolucao(
    tx: Tx,
    data: {
      clinica_id: string;
      paciente_id: string;
      usuario_id: string;
      data_evolucao: Date;
      descricao: string;
      escala_dor?: number;
      observacoes?: string;
      sessao_id?: string;
    },
  ): Promise<Evolucao> {
    return tx.evolucao.create({ data });
  }

  async atualizarEvolucao(
    tx: Tx,
    clinicaId: string,
    id: string,
    data: {
      data_evolucao: Date;
      descricao: string;
      escala_dor?: number | null;
      observacoes?: string | null;
      sessao_id?: string | null;
    },
  ): Promise<Evolucao> {
    const existente = await tx.evolucao.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) throw new Error("Evolução não encontrada.");
    return tx.evolucao.update({ where: { id }, data });
  }

  async softDeleteEvolucao(tx: Tx, clinicaId: string, id: string) {
    const existente = await tx.evolucao.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) throw new Error("Evolução não encontrada.");
    return tx.evolucao.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  // ── Alta ──────────────────────────────────────────────

  async buscarAltaAtiva(
    clinicaId: string,
    pacienteId: string,
  ): Promise<Alta | null> {
    return prisma.alta.findFirst({
      where: {
        clinica_id: clinicaId,
        paciente_id: pacienteId,
        data_reabertura: null,
        deleted_at: null,
      },
      orderBy: [{ data_alta: "desc" }, { created_at: "desc" }],
    });
  }

  async criarAlta(
    tx: Tx,
    data: {
      clinica_id: string;
      paciente_id: string;
      usuario_id: string;
      data_alta: Date;
      motivo?: string;
      observacoes?: string;
    },
  ): Promise<Alta> {
    return tx.alta.create({ data });
  }

  async reabrirAlta(
    tx: Tx,
    clinicaId: string,
    altaId: string,
    usuarioReaberturaId: string,
  ): Promise<Alta> {
    const existente = await tx.alta.findFirst({
      where: {
        id: altaId,
        clinica_id: clinicaId,
        data_reabertura: null,
        deleted_at: null,
      },
    });
    if (!existente) throw new Error("Alta ativa não encontrada.");
    return tx.alta.update({
      where: { id: altaId },
      data: {
        data_reabertura: new Date(),
        usuario_reabertura_id: usuarioReaberturaId,
      },
    });
  }

  async atualizarStatusPaciente(
    tx: Tx,
    clinicaId: string,
    pacienteId: string,
    status: "em_tratamento" | "alta",
  ) {
    return tx.paciente.updateMany({
      where: { id: pacienteId, clinica_id: clinicaId, deleted_at: null },
      data: { status },
    });
  }
}
