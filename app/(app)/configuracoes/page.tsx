import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ClinicaForm } from "@/features/configuracoes/components/clinica-form";
import { AgendaConfigForm } from "@/features/configuracoes/components/agenda-config-form";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { ClinicaService } from "@/services/clinicas/clinica-service";
import { redirectUriOAuth } from "@/lib/agenda/oauth-redirect";

type Props = {
  searchParams: Promise<{ google?: string }>;
};

export default async function ConfiguracoesPage({ searchParams }: Props) {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "clinica.configurar")) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const mensagemGoogle = params.google
    ? decodeURIComponent(params.google)
    : null;

  const clinica = await new ClinicaService().obterMinha(sessao);
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const oauthClientId =
    clinica.agenda_google_oauth_client_id ??
    process.env.GOOGLE_CALENDAR_CLIENT_ID ??
    "";

  const temOAuthSecret = Boolean(
    clinica.agenda_google_oauth_client_secret ||
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim(),
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" />
      <div className="max-w-3xl space-y-6">
        <AgendaConfigForm
          oauthClientId={oauthClientId}
          temOAuthSecret={temOAuthSecret}
          calendarId={clinica.agenda_google_calendar_id ?? "primary"}
          embedUrl={clinica.agenda_embed_url ?? ""}
          conectado={Boolean(clinica.agenda_google_refresh_token)}
          watchExpiraEm={clinica.agenda_google_watch_expira_em}
          redirectUri={redirectUriOAuth()}
          appUrl={appUrl}
          mensagemGoogle={mensagemGoogle}
        />
        <div className="rounded-xl border border-border bg-surface-raised p-6">
          <h2 className="mb-4 text-sm font-semibold text-ink">Dados da clínica</h2>
          <ClinicaForm
            clinica={{
              nome: clinica.nome,
              cnpj: clinica.cnpj,
              telefone: clinica.telefone,
              email: clinica.email,
              endereco: clinica.endereco,
              ativa: clinica.ativa,
            }}
          />
        </div>
      </div>
    </div>
  );
}
