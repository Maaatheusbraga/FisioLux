import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PacientesFiltros } from "@/features/pacientes/components/pacientes-filtros";
import { PacientesTabela } from "@/features/pacientes/components/pacientes-tabela";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { PacienteService } from "@/services/pacientes/paciente-service";
import { listarPacientesQuerySchema } from "@/lib/validations/paciente";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PacientesPage({ searchParams }: Props) {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "pacientes.gerenciar")) {
    redirect("/dashboard");
  }

  const raw = await searchParams;
  const parsed = listarPacientesQuerySchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
    page: typeof raw.page === "string" ? raw.page : undefined,
  });

  const query = parsed.success
    ? parsed.data
    : { q: undefined, status: "todos" as const, page: 1 };

  const service = new PacienteService();
  const resultado = await service.listar(sessao, {
    busca: query.q,
    status: query.status,
    page: query.page,
  });

  const totalPages = Math.max(1, Math.ceil(resultado.total / resultado.pageSize));

  return (
    <div>
      <PageHeader
        title="Pacientes"
        description="Cadastro e histórico cadastral dos pacientes da clínica."
        actions={
          <Link href="/pacientes/novo">
            <Button type="button">Novo paciente</Button>
          </Link>
        }
      >
        <PacientesFiltros q={query.q} status={query.status} />
      </PageHeader>

      <PacientesTabela pacientes={resultado.items} />

      <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
        <p>
          {resultado.total} paciente{resultado.total === 1 ? "" : "s"}
        </p>
        {totalPages > 1 ? (
          <div className="flex gap-2">
            {resultado.page > 1 ? (
              <Link
                href={`/pacientes?q=${encodeURIComponent(query.q ?? "")}&status=${query.status}&page=${resultado.page - 1}`}
                className="hover:text-ink"
              >
                Anterior
              </Link>
            ) : null}
            <span>
              Página {resultado.page} / {totalPages}
            </span>
            {resultado.page < totalPages ? (
              <Link
                href={`/pacientes?q=${encodeURIComponent(query.q ?? "")}&status=${query.status}&page=${resultado.page + 1}`}
                className="hover:text-ink"
              >
                Próxima
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
