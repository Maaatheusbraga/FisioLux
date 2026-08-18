import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResumoClinica } from "@/components/dashboard/resumo-clinica";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { DashboardService } from "@/services/dashboard/dashboard-service";
import { formatarDataBr, formatarDataHoraBr } from "@/utils/date";

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

      <ResumoClinica
        emTratamento={resumo.pacientesEmTratamento}
        altas={resumo.pacientesAlta}
        atendimentos30d={resumo.sessoesRegistradas30d}
        serie={resumo.atendimentosPorDia}
      />

      <section className={clinico ? "grid gap-6 lg:grid-cols-2" : undefined}>
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
                Nenhum paciente
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

        {clinico ? (
          <div className="rounded-xl border border-border bg-surface-raised">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold text-ink">
                Atendimentos recentes
              </h2>
              <Link
                href="/sessoes"
                className="text-xs text-ink-muted hover:text-ink"
              >
                Ver todos
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {resumo.sessoesRecentes.length === 0 ? (
                <li className="px-5 py-8 text-center text-sm text-ink-muted">
                  Nenhum atendimento
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
        ) : null}
      </section>
    </div>
  );
}
