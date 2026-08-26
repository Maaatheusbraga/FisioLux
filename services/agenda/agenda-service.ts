import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors/app-error";
import { assertPermissao } from "@/lib/auth/permissoes";
import type { SessaoUsuario } from "@/lib/auth/sessao";
import { AgendaRepository } from "@/repositories/agenda/agenda-repository";
import {
  GoogleCalendarService,
  type ClinicaAgendaOAuth,
} from "@/services/agenda/google-calendar-service";
import type { AgendaEventoFormInput } from "@/lib/validations/agenda";
import type { calendar_v3 } from "googleapis";
import { formatarDataBr, limitesDoDiaBr } from "@/utils/date";

export class AgendaService {
  constructor(
    private readonly agenda = new AgendaRepository(),
    private readonly google = new GoogleCalendarService(),
  ) {}

  async listarHistoricoPaciente(sessao: SessaoUsuario, pacienteId: string) {
    assertPermissao(sessao.perfil, "pacientes.gerenciar");

    const paciente = await prisma.paciente.findFirst({
      where: {
        id: pacienteId,
        clinica_id: sessao.clinicaId,
        deleted_at: null,
      },
      select: { id: true },
    });
    if (!paciente) {
      throw new AppError("Paciente não encontrado.", "PACIENTE_NOT_FOUND");
    }

    return this.agenda.listarPorPaciente(sessao.clinicaId, pacienteId);
  }

  async obterEstadoAgenda(sessao: SessaoUsuario) {
    assertPermissao(sessao.perfil, "pacientes.gerenciar");
    const clinica = await this.buscarClinicaAgenda(sessao.clinicaId);
    const conectado = Boolean(clinica.agenda_google_refresh_token);

    const { inicio: inicioDia, fim: fimDia } = limitesDoDiaBr();

    const eventos = conectado
      ? await this.agenda.listarPorPeriodo(sessao.clinicaId, inicioDia, fimDia)
      : [];

    return {
      conectado,
      calendarId: clinica.agenda_google_calendar_id ?? "primary",
      embedUrl: clinica.agenda_embed_url,
      watchExpiraEm: clinica.agenda_google_watch_expira_em,
      eventos,
      diaReferencia: formatarDataBr(new Date()),
    };
  }

  async sincronizarManual(sessao: SessaoUsuario) {
    assertPermissao(sessao.perfil, "pacientes.gerenciar");
    const { inicio, fim } = limitesDoDiaBr();
    await this.sincronizarPeriodo(sessao.clinicaId, inicio, fim);
    return this.obterEstadoAgenda(sessao);
  }

  async criar(sessao: SessaoUsuario, input: AgendaEventoFormInput) {
    assertPermissao(sessao.perfil, "pacientes.gerenciar");
    const clinica = await this.buscarClinicaAgenda(sessao.clinicaId);
    if (!clinica.agenda_google_refresh_token) {
      throw new AppError(
        "Conecte o Google Calendar em Configurações antes de criar eventos.",
        "AGENDA_NOT_CONNECTED",
      );
    }

    if (input.paciente_id) {
      await this.validarPaciente(sessao.clinicaId, input.paciente_id);
    }

    const auth = await this.google.clienteAutenticado(clinica);
    const calendar = this.google.api(auth);
    const calendarId = this.google.calendarId(clinica);

    const body = this.google.montarEventoGoogle({
      clinicaId: sessao.clinicaId,
      pacienteId: input.paciente_id,
      usuarioId: sessao.usuarioId,
      titulo: input.titulo,
      descricao: input.descricao,
      inicio: input.inicio,
      fim: input.fim,
    });

    const criado = await calendar.events.insert({
      calendarId,
      requestBody: body,
    });

    if (!criado.data.id) {
      throw new AppError("Google não retornou ID do evento.", "GOOGLE_ERROR");
    }

    return prisma.$transaction(async (tx) => {
      return this.agenda.criar(tx, {
        clinica_id: sessao.clinicaId,
        paciente_id: input.paciente_id ?? null,
        usuario_id: sessao.usuarioId,
        google_event_id: criado.data.id!,
        google_calendar_id: calendarId,
        titulo: input.titulo,
        descricao: input.descricao ?? null,
        inicio: input.inicio,
        fim: input.fim,
        google_updated_at: criado.data.updated
          ? new Date(criado.data.updated)
          : null,
      });
    });
  }

  async atualizar(
    sessao: SessaoUsuario,
    eventoId: string,
    input: AgendaEventoFormInput,
  ) {
    assertPermissao(sessao.perfil, "pacientes.gerenciar");
    const local = await this.agenda.buscarPorId(eventoId, sessao.clinicaId);
    if (!local) {
      throw new AppError("Evento não encontrado.", "NOT_FOUND");
    }

    const clinica = await this.buscarClinicaAgenda(sessao.clinicaId);
    if (!clinica.agenda_google_refresh_token) {
      throw new AppError("Google Calendar não conectado.", "AGENDA_NOT_CONNECTED");
    }

    if (input.paciente_id) {
      await this.validarPaciente(sessao.clinicaId, input.paciente_id);
    }

    const auth = await this.google.clienteAutenticado(clinica);
    const calendar = this.google.api(auth);
    const calendarId = local.google_calendar_id || this.google.calendarId(clinica);

    const body = this.google.montarEventoGoogle({
      clinicaId: sessao.clinicaId,
      pacienteId: input.paciente_id,
      usuarioId: local.usuario_id ?? sessao.usuarioId,
      titulo: input.titulo,
      descricao: input.descricao,
      inicio: input.inicio,
      fim: input.fim,
    });

    const atualizado = await calendar.events.update({
      calendarId,
      eventId: local.google_event_id,
      requestBody: body,
    });

    return prisma.$transaction(async (tx) => {
      return this.agenda.atualizar(tx, local.id, {
        paciente_id: input.paciente_id ?? null,
        titulo: input.titulo,
        descricao: input.descricao ?? null,
        inicio: input.inicio,
        fim: input.fim,
        google_updated_at: atualizado.data.updated
          ? new Date(atualizado.data.updated)
          : null,
      });
    });
  }

  async excluir(sessao: SessaoUsuario, eventoId: string) {
    assertPermissao(sessao.perfil, "pacientes.gerenciar");
    const local = await this.agenda.buscarPorId(eventoId, sessao.clinicaId);
    if (!local) {
      throw new AppError("Evento não encontrado.", "NOT_FOUND");
    }

    const clinica = await this.buscarClinicaAgenda(sessao.clinicaId);
    if (clinica.agenda_google_refresh_token) {
      const auth = await this.google.clienteAutenticado(clinica);
      const calendar = this.google.api(auth);
      try {
        await calendar.events.delete({
          calendarId: local.google_calendar_id || this.google.calendarId(clinica),
          eventId: local.google_event_id,
        });
      } catch {
        // Evento pode já ter sido removido no Google
      }
    }

    await prisma.$transaction(async (tx) => {
      await this.agenda.softDelete(tx, sessao.clinicaId, local.id);
    });
  }

  async processarWebhook(clinicaId: string, resourceState: string) {
    if (!clinicaId) return;
    if (resourceState === "sync") {
      await this.sincronizarClinica(clinicaId);
      return;
    }
    if (resourceState === "exists") {
      await this.sincronizarClinica(clinicaId);
    }
  }

  /** Sync rápida por período (botão Sincronizar na UI — só o dia atual). */
  async sincronizarPeriodo(
    clinicaId: string,
    de: Date,
    ate: Date,
  ): Promise<void> {
    const clinica = await this.buscarClinicaAgenda(clinicaId);
    if (!clinica.agenda_google_refresh_token) {
      throw new AppError(
        "Conecte o Google Calendar em Configurações.",
        "AGENDA_NOT_CONNECTED",
      );
    }

    const auth = await this.google.clienteAutenticado(clinica);
    const calendar = this.google.api(auth);
    const calendarId = this.google.calendarId(clinica);

    let pageToken: string | undefined;
    do {
      const res = await calendar.events.list({
        calendarId,
        pageToken,
        singleEvents: true,
        timeMin: de.toISOString(),
        timeMax: ate.toISOString(),
        maxResults: 250,
      });

      for (const item of res.data.items ?? []) {
        await this.aplicarEventoGoogle(clinicaId, calendarId, item);
      }

      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);
  }

  async sincronizarClinica(clinicaId: string): Promise<void> {
    const clinica = await this.buscarClinicaAgenda(clinicaId);
    if (!clinica.agenda_google_refresh_token) return;

    await this.google.renovarWatchSeNecessario(clinica);

    const auth = await this.google.clienteAutenticado(clinica);
    const calendar = this.google.api(auth);
    const calendarId = this.google.calendarId(clinica);

    let syncToken = clinica.agenda_google_sync_token ?? undefined;
    let pageToken: string | undefined;
    let nextSyncToken: string | undefined;

    try {
      do {
        const res = await calendar.events.list({
          calendarId,
          syncToken,
          pageToken,
          singleEvents: true,
          showDeleted: true,
          maxResults: 250,
          ...(syncToken
            ? {}
            : {
                timeMin: new Date(
                  Date.now() - 90 * 24 * 60 * 60 * 1000,
                ).toISOString(),
              }),
        });

        for (const item of res.data.items ?? []) {
          await this.aplicarEventoGoogle(clinicaId, calendarId, item);
        }

        pageToken = res.data.nextPageToken ?? undefined;
        nextSyncToken = res.data.nextSyncToken ?? nextSyncToken;
      } while (pageToken);

      if (nextSyncToken) {
        await prisma.clinica.update({
          where: { id: clinicaId },
          data: { agenda_google_sync_token: nextSyncToken },
        });
      }
    } catch (error: unknown) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code;
      if (code === 410) {
        await prisma.clinica.update({
          where: { id: clinicaId },
          data: { agenda_google_sync_token: null },
        });
        return this.sincronizarClinica(clinicaId);
      }
      throw error;
    }
  }

  private async aplicarEventoGoogle(
    clinicaId: string,
    calendarId: string,
    evento: calendar_v3.Schema$Event,
  ) {
    if (!evento.id) return;

    if (evento.status === "cancelled") {
      const existente = await this.agenda.buscarPorGoogleEventId(
        clinicaId,
        evento.id,
      );
      if (existente && !existente.deleted_at) {
        await prisma.$transaction(async (tx) => {
          await this.agenda.softDelete(tx, clinicaId, existente.id);
        });
      }
      return;
    }

    const datas = this.google.parseGoogleEventDates(evento);
    if (!datas) return;

    const pacienteGoogle = this.google.extrairPacienteId(evento);
    const existente = await this.agenda.buscarPorGoogleEventId(
      clinicaId,
      evento.id,
    );

    let pacienteId: string | null = pacienteGoogle ?? existente?.paciente_id ?? null;
    if (pacienteId) {
      const ok = await prisma.paciente.findFirst({
        where: {
          id: pacienteId,
          clinica_id: clinicaId,
          deleted_at: null,
        },
        select: { id: true },
      });
      if (!ok) pacienteId = existente?.paciente_id ?? null;
    }

    const usuarioGoogle = this.google.extrairUsuarioId(evento);
    let usuarioId: string | null = usuarioGoogle ?? existente?.usuario_id ?? null;
    if (usuarioId) {
      const ok = await prisma.usuario.findFirst({
        where: {
          id: usuarioId,
          clinica_id: clinicaId,
          deleted_at: null,
        },
        select: { id: true },
      });
      if (!ok) usuarioId = existente?.usuario_id ?? null;
    }

    await prisma.$transaction(async (tx) => {
      await this.agenda.upsertPorGoogle(tx, clinicaId, evento.id!, {
        paciente_id: pacienteId,
        usuario_id: usuarioId,
        google_calendar_id: calendarId,
        titulo: evento.summary?.trim() || "Sem título",
        descricao: evento.description ?? null,
        inicio: datas.inicio,
        fim: datas.fim,
        google_updated_at: evento.updated ? new Date(evento.updated) : null,
      });
    });
  }

  private async buscarClinicaAgenda(
    clinicaId: string,
  ): Promise<
    ClinicaAgendaOAuth & { agenda_embed_url: string | null }
  > {
    const clinica = await prisma.clinica.findFirst({
      where: { id: clinicaId, deleted_at: null },
      select: {
        id: true,
        agenda_embed_url: true,
        agenda_google_calendar_id: true,
        agenda_google_access_token: true,
        agenda_google_refresh_token: true,
        agenda_google_token_expira_em: true,
        agenda_google_sync_token: true,
        agenda_google_watch_channel_id: true,
        agenda_google_watch_resource_id: true,
        agenda_google_watch_expira_em: true,
      },
    });
    if (!clinica) {
      throw new AppError("Clínica não encontrada.", "CLINICA_NOT_FOUND");
    }
    return clinica;
  }

  private async validarPaciente(clinicaId: string, pacienteId: string) {
    const paciente = await prisma.paciente.findFirst({
      where: { id: pacienteId, clinica_id: clinicaId, deleted_at: null },
      select: { id: true },
    });
    if (!paciente) {
      throw new AppError("Paciente inválido.", "VALIDATION");
    }
  }
}
