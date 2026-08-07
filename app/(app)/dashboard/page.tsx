import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { obterSessaoAtual } from "@/lib/auth/sessao";
import { permissoesDoPerfil } from "@/lib/auth/permissoes";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const sessao = await obterSessaoAtual();
  if (!sessao) {
    redirect("/login");
  }

  const permissoes = permissoesDoPerfil(sessao.perfil);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral da clínica. Indicadores completos entram na Fase 12."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface-raised p-5">
          <h2 className="text-sm font-medium text-ink-muted">Sessão</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-subtle">Nome</dt>
              <dd className="text-right font-medium">{sessao.nome}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-subtle">E-mail</dt>
              <dd className="text-right">{sessao.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-subtle">Perfil</dt>
              <dd className="capitalize">{sessao.perfil}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-surface-raised p-5">
          <h2 className="text-sm font-medium text-ink-muted">Permissões</h2>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {permissoes.map((p) => (
              <li key={p}>
                <Badge className="font-mono">{p}</Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-8 text-sm text-ink-subtle">
        Use a sidebar para navegar. Itens marcados como{" "}
        <span className="text-ink-muted">em breve</span> já possuem rota de
        layout; a regra de negócio virá nas próximas fases.
      </p>
    </div>
  );
}
