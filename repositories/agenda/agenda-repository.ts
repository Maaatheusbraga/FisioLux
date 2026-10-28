import { prisma } from "@/lib/prisma";
import type { AgendaEvento, Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export type AgendaEventoListaItem = {
  id: string;
  titulo: string;
  descricao: string | null;
  inicio: Date;
  fim: Date;
  paciente: { id: string; nome: string } | null;
  usuario: { id: string; nome: string } | null;
};

export type AgendaEventoComRelacoes = AgendaEvento & {
  paciente: { id: string; nome: string } | null;
  usuario: { id: string; nome: string } | null;
};

const selectLista = {
  id: true,
  titulo: true,
  descricao: true,
  inicio: true,
  fim: true,
  paciente: { select: { id: true, nome: true } },
  usuario: { select: { id: true, nome: true } },
} as const;

export class AgendaRepository {
  async listarPorPeriodo(
    clinicaId: string,
    de: Date,
    ate: Date,
  ): Promise<AgendaEventoListaItem[]> {
    return prisma.agendaEvento.findMany({
      where: {
        clinica_id: clinicaId,
        deleted_at: null,
        inicio: { gte: de, lte: ate },
      },
      select: selectLista,
      orderBy: { inicio: "asc" },
    });
  }

  async buscarPorId(
    id: string,
    clinicaId: string,
  ): Promise<AgendaEventoComRelacoes | null> {
    return prisma.agendaEvento.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
      include: {
        paciente: { select: { id: true, nome: true } },
        usuario: { select: { id: true, nome: true } },
      },
    });
  }

  async buscarPorGoogleEventId(
    clinicaId: string,
    googleEventId: string,
  ): Promise<AgendaEvento | null> {
    return prisma.agendaEvento.findFirst({
      where: { clinica_id: clinicaId, google_event_id: googleEventId },
    });
  }

  async criar(
    tx: Tx,
    data: {
      clinica_id: string;
      paciente_id?: string | null;
      usuario_id?: string | null;
      google_event_id: string;
      google_calendar_id: string;
      titulo: string;
      descricao?: string | null;
      inicio: Date;
      fim: Date;
      google_updated_at?: Date | null;
    },
  ) {
    return tx.agendaEvento.create({ data });
  }

  async atualizar(
    tx: Tx,
    clinicaId: string,
    id: string,
    data: {
      paciente_id?: string | null;
      titulo?: string;
      descricao?: string | null;
      inicio?: Date;
      fim?: Date;
      google_updated_at?: Date | null;
    },
  ) {
    const existente = await tx.agendaEvento.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
      select: { id: true },
    });
    if (!existente) {
      throw new Error("Evento não encontrado.");
    }
    return tx.agendaEvento.update({ where: { id }, data });
  }

  async softDelete(tx: Tx, clinicaId: string, id: string) {
    return tx.agendaEvento.updateMany({
      where: { id, clinica_id: clinicaId, deleted_at: null },
      data: { deleted_at: new Date() },
    });
  }

  async listarPorPaciente(
    clinicaId: string,
    pacienteId: string,
    limite = 100,
  ): Promise<AgendaEventoListaItem[]> {
    return prisma.agendaEvento.findMany({
      where: {
        clinica_id: clinicaId,
        paciente_id: pacienteId,
        deleted_at: null,
      },
      select: selectLista,
      orderBy: { inicio: "desc" },
      take: limite,
    });
  }

  async buscarStatusGoogle(clinicaId: string) {
    return prisma.clinica.findFirst({
      where: { id: clinicaId, deleted_at: null },
      select: {
        agenda_google_refresh_token: true,
        agenda_google_calendar_id: true,
        agenda_google_watch_expira_em: true,
      },
    });
  }

  async upsertPorGoogle(
    tx: Tx,
    clinicaId: string,
    googleEventId: string,
    data: {
      paciente_id?: string | null;
      usuario_id?: string | null;
      google_calendar_id: string;
      titulo: string;
      descricao?: string | null;
      inicio: Date;
      fim: Date;
      google_updated_at?: Date | null;
    },
  ) {
    const existente = await tx.agendaEvento.findFirst({
      where: { clinica_id: clinicaId, google_event_id: googleEventId },
    });

    if (existente) {
      const pacienteId =
        data.paciente_id !== undefined
          ? data.paciente_id
          : existente.paciente_id;
      const usuarioId =
        data.usuario_id !== undefined
          ? data.usuario_id
          : existente.usuario_id;

      return tx.agendaEvento.update({
        where: { id: existente.id },
        data: {
          ...data,
          paciente_id: pacienteId,
          usuario_id: usuarioId,
          deleted_at: null,
        },
      });
    }

    return tx.agendaEvento.create({
      data: {
        clinica_id: clinicaId,
        google_event_id: googleEventId,
        ...data,
      },
    });
  }
}
