import { randomUUID } from "crypto";
import { google, type calendar_v3 } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors/app-error";
import { criptografar, descriptografar } from "@/lib/security/secret-crypto";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
export const FISIOLUX_PROP_PACIENTE = "fisiolux_paciente_id";
export const FISIOLUX_PROP_CLINICA = "fisiolux_clinica_id";

export type ClinicaAgendaOAuth = {
  id: string;
  agenda_google_oauth_client_id?: string | null;
  agenda_google_oauth_client_secret?: string | null;
  agenda_google_calendar_id: string | null;
  agenda_google_access_token: string | null;
  agenda_google_refresh_token: string | null;
  agenda_google_token_expira_em: Date | null;
  agenda_google_sync_token: string | null;
  agenda_google_watch_channel_id: string | null;
  agenda_google_watch_resource_id: string | null;
  agenda_google_watch_expira_em: Date | null;
};

export function redirectUriOAuth() {
  const base = process.env.APP_URL?.trim().replace(/\/$/, "") ?? "http://localhost:3000";
  return (
    process.env.GOOGLE_CALENDAR_REDIRECT_URI?.trim() ||
    `${base}/api/google-calendar/callback`
  );
}

export function resolverCredenciaisOAuth(clinica?: {
  agenda_google_oauth_client_id?: string | null;
  agenda_google_oauth_client_secret?: string | null;
} | null) {
  const clientId =
    clinica?.agenda_google_oauth_client_id?.trim() ||
    process.env.GOOGLE_CALENDAR_CLIENT_ID?.trim();

  let clientSecret =
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim() || undefined;

  if (clinica?.agenda_google_oauth_client_secret) {
    try {
      clientSecret = descriptografar(clinica.agenda_google_oauth_client_secret);
    } catch {
      throw new AppError(
        "Chave secreta OAuth inválida. Salve novamente em Configurações.",
        "AGENDA_OAUTH_CONFIG",
      );
    }
  }

  if (!clientId || !clientSecret) {
    throw new AppError(
      "Configure o Client ID e a chave secreta OAuth em Configurações → Integração Google Calendar.",
      "AGENDA_OAUTH_CONFIG",
    );
  }

  return { clientId, clientSecret };
}

/** Google exige HTTPS no webhook; em localhost usamos sync manual. */
export function urlWebhookPublica(): string | null {
  const base = process.env.APP_URL?.trim().replace(/\/$/, "");
  if (!base?.startsWith("https://")) return null;
  return `${base}/api/google-calendar/webhook`;
}

export class GoogleCalendarService {
  private async criarClienteOAuth(clinicaId: string) {
    const clinica = await prisma.clinica.findUnique({
      where: { id: clinicaId },
      select: {
        agenda_google_oauth_client_id: true,
        agenda_google_oauth_client_secret: true,
      },
    });
    const { clientId, clientSecret } = resolverCredenciaisOAuth(clinica);
    return new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUriOAuth(),
    );
  }

  async urlAutorizacao(clinicaId: string, state: string) {
    const client = await this.criarClienteOAuth(clinicaId);
    return client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES,
      state,
    });
  }

  async trocarCodigoPorTokens(clinicaId: string, code: string) {
    const client = await this.criarClienteOAuth(clinicaId);
    const { tokens } = await client.getToken(code);
    return tokens;
  }

  calendarId(clinica: ClinicaAgendaOAuth) {
    return clinica.agenda_google_calendar_id?.trim() || "primary";
  }

  async clienteAutenticado(
    clinica: ClinicaAgendaOAuth,
  ): Promise<OAuth2Client> {
    if (!clinica.agenda_google_refresh_token) {
      throw new Error("Google Calendar não conectado para esta clínica.");
    }

    const client = await this.criarClienteOAuth(clinica.id);
    const refreshToken = descriptografar(clinica.agenda_google_refresh_token);
    const accessToken = clinica.agenda_google_access_token
      ? descriptografar(clinica.agenda_google_access_token)
      : undefined;

    client.setCredentials({
      refresh_token: refreshToken,
      access_token: accessToken,
      expiry_date: clinica.agenda_google_token_expira_em?.getTime(),
    });

    client.on("tokens", async (tokens) => {
      await this.persistirTokens(clinica.id, tokens);
    });

    await client.getAccessToken();
    return client;
  }

  async persistirTokens(
    clinicaId: string,
    tokens: {
      access_token?: string | null;
      refresh_token?: string | null;
      expiry_date?: number | null;
    },
  ) {
    const data: {
      agenda_google_access_token?: string;
      agenda_google_refresh_token?: string;
      agenda_google_token_expira_em?: Date | null;
    } = {};

    if (tokens.access_token) {
      data.agenda_google_access_token = criptografar(tokens.access_token);
    }
    if (tokens.refresh_token) {
      data.agenda_google_refresh_token = criptografar(tokens.refresh_token);
    }
    if (tokens.expiry_date) {
      data.agenda_google_token_expira_em = new Date(tokens.expiry_date);
    }

    if (Object.keys(data).length === 0) return;

    await prisma.clinica.update({
      where: { id: clinicaId },
      data,
    });
  }

  async salvarConexao(
    clinicaId: string,
    tokens: {
      access_token?: string | null;
      refresh_token?: string | null;
      expiry_date?: number | null;
    },
  ) {
    if (!tokens.refresh_token) {
      throw new Error(
        "Google não retornou refresh token. Revogue o acesso em myaccount.google.com/permissions e conecte novamente.",
      );
    }

    await prisma.clinica.update({
      where: { id: clinicaId },
      data: {
        agenda_google_access_token: tokens.access_token
          ? criptografar(tokens.access_token)
          : null,
        agenda_google_refresh_token: criptografar(tokens.refresh_token),
        agenda_google_token_expira_em: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
        agenda_google_sync_token: null,
      },
    });
  }

  async desconectar(clinicaId: string) {
    const clinica = await prisma.clinica.findUnique({ where: { id: clinicaId } });
    if (!clinica) return;

    if (
      clinica.agenda_google_watch_channel_id &&
      clinica.agenda_google_watch_resource_id &&
      clinica.agenda_google_refresh_token
    ) {
      try {
        const auth = await this.clienteAutenticado(clinica);
        const calendar = google.calendar({ version: "v3", auth });
        await calendar.channels.stop({
          requestBody: {
            id: clinica.agenda_google_watch_channel_id,
            resourceId: clinica.agenda_google_watch_resource_id,
          },
        });
      } catch {
        // Canal pode já ter expirado
      }
    }

    await prisma.clinica.update({
      where: { id: clinicaId },
      data: {
        agenda_google_access_token: null,
        agenda_google_refresh_token: null,
        agenda_google_token_expira_em: null,
        agenda_google_sync_token: null,
        agenda_google_watch_channel_id: null,
        agenda_google_watch_resource_id: null,
        agenda_google_watch_expira_em: null,
      },
    });
  }

  api(auth: OAuth2Client) {
    return google.calendar({ version: "v3", auth });
  }

  extrairPacienteId(evento: calendar_v3.Schema$Event): string | undefined {
    return evento.extendedProperties?.private?.[FISIOLUX_PROP_PACIENTE];
  }

  montarEventoGoogle(input: {
    clinicaId: string;
    pacienteId?: string | null;
    titulo: string;
    descricao?: string | null;
    inicio: Date;
    fim: Date;
  }): calendar_v3.Schema$Event {
    const privateProps: Record<string, string> = {
      [FISIOLUX_PROP_CLINICA]: input.clinicaId,
    };
    if (input.pacienteId) {
      privateProps[FISIOLUX_PROP_PACIENTE] = input.pacienteId;
    }

    return {
      summary: input.titulo,
      description: input.descricao ?? undefined,
      start: { dateTime: input.inicio.toISOString() },
      end: { dateTime: input.fim.toISOString() },
      extendedProperties: { private: privateProps },
    };
  }

  parseGoogleEventDates(evento: calendar_v3.Schema$Event): {
    inicio: Date;
    fim: Date;
  } | null {
    const inicioRaw =
      evento.start?.dateTime ?? (evento.start?.date ? `${evento.start.date}T12:00:00Z` : null);
    const fimRaw =
      evento.end?.dateTime ?? (evento.end?.date ? `${evento.end.date}T13:00:00Z` : null);
    if (!inicioRaw || !fimRaw) return null;
    return { inicio: new Date(inicioRaw), fim: new Date(fimRaw) };
  }

  async registrarWatch(clinica: ClinicaAgendaOAuth) {
    const webhookUrl = urlWebhookPublica();
    if (!webhookUrl) return;

    const auth = await this.clienteAutenticado(clinica);
    const calendar = this.api(auth);
    const channelId = randomUUID();
    const expiration = Date.now() + 6 * 24 * 60 * 60 * 1000;

    const res = await calendar.events.watch({
      calendarId: this.calendarId(clinica),
      requestBody: {
        id: channelId,
        type: "web_hook",
        address: webhookUrl,
        token: clinica.id,
        expiration: String(expiration),
      },
    });

    await prisma.clinica.update({
      where: { id: clinica.id },
      data: {
        agenda_google_watch_channel_id: res.data.id ?? channelId,
        agenda_google_watch_resource_id: res.data.resourceId ?? null,
        agenda_google_watch_expira_em: res.data.expiration
          ? new Date(Number(res.data.expiration))
          : new Date(expiration),
      },
    });
  }

  async renovarWatchSeNecessario(clinica: ClinicaAgendaOAuth) {
    if (!clinica.agenda_google_refresh_token) return;
    if (!urlWebhookPublica()) return;

    const limite = clinica.agenda_google_watch_expira_em;
    if (limite && limite.getTime() - Date.now() > 24 * 60 * 60 * 1000) {
      return;
    }

    try {
      await this.registrarWatch(clinica);
    } catch {
      // Webhook opcional — sync manual segue funcionando
    }
  }
}
