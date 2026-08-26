import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { AgendaService } from "@/services/agenda/agenda-service";

const AgendaPainel = dynamic(
  () =>
    import("@/features/agenda/components/agenda-painel").then(
      (m) => m.AgendaPainel,
    ),
  {
    loading: () => (
      <p className="text-sm text-ink-muted">Carregando agenda…</p>
    ),
  },
);

function extrairSrcGoogleCalendar(input: string): string {
  const bruto = input.trim();
  if (!bruto) return "";
  if (bruto.includes("<iframe")) {
    const match = bruto.match(/src="([^"]+)"/i);
    return match?.[1] ?? "";
  }
  return bruto;
}

export default async function AgendaPage() {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "pacientes.gerenciar")) {
    redirect("/dashboard");
  }

  const estado = await new AgendaService().obterEstadoAgenda(sessao);
  const embedSrc = extrairSrcGoogleCalendar(estado.embedUrl ?? "");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        description="Eventos do Google Calendar vinculados a pacientes. Alterações externas sincronizam via webhook."
      />
      <AgendaPainel
        conectado={estado.conectado}
        eventos={estado.eventos}
        diaReferencia={estado.diaReferencia}
        embedSrc={embedSrc || undefined}
      />
    </div>
  );
}
