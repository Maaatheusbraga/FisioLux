import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { DashboardService } from "@/services/dashboard/dashboard-service";
import { formatarDataBr, formatarDataHoraBr } from "@/utils/date";

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-ink-subtle">{hint}</p> : null}
    </div>
  );
}

export default async function DashboardPage() {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "pacientes.gerenciar")) {
    redirect("/login");
  }

  const resumo = await new DashboardService().obterResumo(sessao);
  const clinico =
    possuiPermissao(sessao.perfil, "sessoes.gerenciar") ||
    possuiPermissao(sessao.perfil, "prontuario.acessar");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Início"
        help="Comece pelo paciente ou registre um atendimento já realizado. Sem agenda nesta versão."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/pacientes/novo">
              <Button type="button" size="sm">
                Novo paciente
              </Button>
            </Link>
            {clinico ? (
              <Link href="/sessoes/nova">
                <Button type="button" variant="secondary" size="sm">
                  Registrar atendimento
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Kpi
          label="Em tratamento"
          value={resumo.pacientesEmTratamento}
          hint={`${resumo.pacientesTotal} no cadastro ativo`}
        />
        <Kpi
          label="Altas"
          value={resumo.pacientesAlta}
          hint="Status alta"
        />
        {clinico ? (
          <Kpi
            label="Atendimentos (30 dias)"
            value={resumo.sessoesRegistradas30d}
            hint={
              resumo.sessoesCanceladas30d > 0
                ? `${resumo.sessoesCanceladas30d} cancelado(s)`
                : "Registros clínicos no período"
            }
          />
        ) : (
          <Kpi
            label="Pacientes recentes"
            value={resumo.pacientesRecentes.length}
            hint="Últimos cadastros na lista abaixo"
          />
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-raised">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-ink">
              Pacientes recentes
            </h2>
            <Link
              href="/pacientes"
              className="text-xs text-ink-muted hover:text-ink"
            >
              Ver todos
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {resumo.pacientesRecentes.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-ink-muted">
                Nenhum paciente ainda.{" "}
                <Link
                  href="/pacientes/novo"
                  className="text-primary hover:underline"
                >
                  Cadastrar
                </Link>
              </li>
            ) : (
              resumo.pacientesRecentes.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/pacientes/${p.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface/60"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{p.nome}</p>
                      <p className="text-xs text-ink-subtle">
                        Desde {formatarDataBr(p.created_at)}
                      </p>
                    </div>
                    <Badge
                      className={
                        p.status === "alta"
                          ? "border-accent/30 text-accent"
                          : "border-primary/30 text-primary"
                      }
                    >
                      {p.status === "alta" ? "Alta" : "Em tratamento"}
                    </Badge>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-surface-raised">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-ink">
              Atendimentos recentes
            </h2>
            {clinico ? (
              <Link
                href="/sessoes"
                className="text-xs text-ink-muted hover:text-ink"
              >
                Ver todos
              </Link>
            ) : null}
          </div>
          <ul className="divide-y divide-border">
            {!clinico ? (
              <li className="px-5 py-8 text-center text-sm text-ink-muted">
                Atendimentos são visíveis para o perfil clínico.
              </li>
            ) : resumo.sessoesRecentes.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-ink-muted">
                Nenhum atendimento registrado.{" "}
                <Link
                  href="/sessoes/nova"
                  className="text-primary hover:underline"
                >
                  Registrar agora
                </Link>
              </li>
            ) : (
              resumo.sessoesRecentes.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/sessoes/${s.id}`}
                    className="block px-5 py-3 hover:bg-surface/60"
                  >
                    <p className="text-sm font-medium text-ink">
                      {s.paciente.nome}
                    </p>
                    <p className="text-xs text-ink-subtle">
                      {formatarDataHoraBr(s.realizado_em)} ·{" "}
                      {s.profissional.nome}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
