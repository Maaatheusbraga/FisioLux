import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SessoesTabela } from "@/features/sessoes/components/sessoes-tabela";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { SessaoService } from "@/services/sessoes/sessao-service";
import { listarSessoesQuerySchema } from "@/lib/validations/sessao";
import { Select } from "@/components/ui/select";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SessoesPage({ searchParams }: Props) {
  const sessaoAuth = await exigirSessao();
  if (!possuiPermissao(sessaoAuth.perfil, "sessoes.gerenciar")) {
    redirect("/dashboard");
  }

  const raw = await searchParams;
  const parsed = listarSessoesQuerySchema.safeParse({
    paciente: typeof raw.paciente === "string" ? raw.paciente : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
    page: typeof raw.page === "string" ? raw.page : undefined,
  });
  const query = parsed.success
    ? parsed.data
    : { status: "todos" as const, page: 1, paciente: undefined };

  const service = new SessaoService();
  const resultado = await service.listar(sessaoAuth, {
    pacienteId: query.paciente,
    status: query.status,
    page: query.page,
  });

  return (
    <div>
      <PageHeader
        title="Sessões"
        description="Registro clínico de atendimentos realizados (não é agenda)."
        actions={
          <Link href="/sessoes/nova">
            <Button type="button">Nova sessão</Button>
          </Link>
        }
      >
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="w-48 space-y-1.5">
            <label htmlFor="status" className="text-sm text-ink-muted">
              Status
            </label>
            <Select id="status" name="status" defaultValue={query.status}>
              <option value="todos">Todos</option>
              <option value="registrada">Registrada</option>
              <option value="cancelada">Cancelada</option>
            </Select>
          </div>
          <Button type="submit" variant="secondary">
            Filtrar
          </Button>
        </form>
      </PageHeader>

      <SessoesTabela sessoes={resultado.items} />

      <p className="mt-4 text-sm text-ink-muted">
        {resultado.total} sessão{resultado.total === 1 ? "" : "ões"}
      </p>
    </div>
  );
}
