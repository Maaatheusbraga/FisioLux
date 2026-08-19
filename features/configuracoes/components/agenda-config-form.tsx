"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  desconectarGoogleAgendaFormAction,
  type AgendaActionState,
} from "@/features/agenda/actions";
import {
  salvarAgendaConfigAction,
  type AgendaConfigActionState,
} from "@/features/configuracoes/actions";
import { formatarDataHoraBr } from "@/utils/date";

const initialAgendaState: AgendaConfigActionState = { ok: false };
const initialDisconnectState: AgendaActionState = { ok: false };

type Props = {
  oauthClientId: string;
  temOAuthSecret: boolean;
  calendarId: string;
  embedUrl: string;
  conectado: boolean;
  watchExpiraEm: Date | string | null;
  redirectUri: string;
  appUrl: string;
  mensagemGoogle?: string | null;
};

export function AgendaConfigForm({
  oauthClientId,
  temOAuthSecret,
  calendarId,
  embedUrl,
  conectado,
  watchExpiraEm,
  redirectUri,
  appUrl,
  mensagemGoogle,
}: Props) {
  const [configState, configAction, configPending] = useActionState(
    salvarAgendaConfigAction,
    initialAgendaState,
  );
  const [disconnectState, disconnectAction, disconnectPending] = useActionState(
    desconectarGoogleAgendaFormAction,
    initialDisconnectState,
  );

  const feedback =
    configState.message ??
    disconnectState.message ??
    (mensagemGoogle === "conectado"
      ? "Google Calendar conectado com sucesso."
      : mensagemGoogle === "conectado-sem-webhook"
        ? "Google Calendar conectado. Webhook automático exige HTTPS na URL pública."
        : mensagemGoogle);

  const feedbackOk =
    configState.ok ||
    disconnectState.ok ||
    mensagemGoogle === "conectado" ||
    mensagemGoogle === "conectado-sem-webhook";

  return (
    <div className="space-y-6 rounded-xl border border-border bg-surface-raised p-6">
      <div>
        <h2 className="text-sm font-semibold text-ink">
          Integração Google Calendar
        </h2>
        <p className="mt-1 text-xs text-ink-subtle">
          Preencha as credenciais do Google Cloud Console, salve e depois
          conecte a conta Google da clínica. Não é necessário editar código ou
          arquivos do servidor.
        </p>
      </div>

      {feedback ? (
        <p
          className={
            feedbackOk
              ? "rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
              : "rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          }
        >
          {feedback}
        </p>
      ) : null}

      <form action={configAction} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="oauth_client_id">Client ID OAuth *</Label>
            <Input
              id="oauth_client_id"
              name="oauth_client_id"
              required
              defaultValue={oauthClientId}
              placeholder="740464941341-....apps.googleusercontent.com"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="oauth_client_secret">Chave secreta OAuth *</Label>
            <Input
              id="oauth_client_secret"
              name="oauth_client_secret"
              type="password"
              autoComplete="new-password"
              placeholder={
                temOAuthSecret
                  ? "••••••••  deixe vazio para manter a atual"
                  : "GOCSPX-..."
              }
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>URI de redirecionamento (copie no Google Cloud)</Label>
            <Input readOnly value={redirectUri} className="font-mono text-xs" />
            <p className="text-xs text-ink-subtle">
              Em Credenciais → Cliente OAuth → URIs autorizadas, adicione exatamente
              este endereço. URL pública do sistema: <code>{appUrl}</code>
            </p>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="agenda_google_calendar_id">ID do calendário</Label>
            <Input
              id="agenda_google_calendar_id"
              name="agenda_google_calendar_id"
              defaultValue={calendarId || "primary"}
              placeholder="primary ou e-mail do calendário"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="agenda_embed_url">URL embed (visualização)</Label>
            <Textarea
              id="agenda_embed_url"
              name="agenda_embed_url"
              rows={2}
              defaultValue={embedUrl}
              placeholder="URL ou iframe do Google Calendar embed"
            />
          </div>
        </div>

        <Button type="submit" disabled={configPending}>
          {configPending ? "Salvando…" : "Salvar integração"}
        </Button>
      </form>

      <div className="border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span
            className={
              conectado
                ? "rounded-full bg-primary/15 px-2.5 py-0.5 text-primary"
                : "rounded-full bg-ink-subtle/15 px-2.5 py-0.5 text-ink-muted"
            }
          >
            {conectado ? "Conta Google conectada" : "Conta Google não conectada"}
          </span>
          {conectado && watchExpiraEm ? (
            <span className="text-xs text-ink-subtle">
              Webhook até {formatarDataHoraBr(watchExpiraEm)}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {!conectado ? (
            <Link
              href="/api/google-calendar/connect"
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg hover:brightness-110"
            >
              Conectar conta Google
            </Link>
          ) : (
            <form action={disconnectAction}>
              <Button type="submit" variant="secondary" disabled={disconnectPending}>
                {disconnectPending ? "Desconectando…" : "Desconectar conta"}
              </Button>
            </form>
          )}
        </div>

        <ol className="mt-4 list-decimal space-y-1 pl-4 text-xs text-ink-subtle">
          <li>Crie projeto no Google Cloud e ative a Google Calendar API.</li>
          <li>Configure a tela de consentimento OAuth (modo teste + usuários de teste).</li>
          <li>Crie credencial &quot;Aplicativo da Web&quot; com a URI de redirecionamento acima.</li>
          <li>Cole Client ID e chave secreta aqui, salve e clique em Conectar.</li>
        </ol>
      </div>
    </div>
  );
}
