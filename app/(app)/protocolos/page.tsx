import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ProtocolosTabela } from "@/features/protocolos/components/protocolos-tabela";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { ProtocoloService } from "@/services/protocolos/protocolo-service";
import { listarProtocolosQuerySchema } from "@/lib/validations/protocolo";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProtocolosPage({ searchParams }: Props) {
  const sessaoAuth = await exigirSessao();
  if (!possuiPermissao(sessaoAuth.perfil, "protocolos.gerenciar")) {
    redirect("/dashboard");
  }

  const raw = await searchParams;
  const parsed = listarProtocolosQuerySchema.safeParse({
    busca: typeof raw.busca === "string" ? raw.busca : undefined,
    ativo: typeof raw.ativo === "string" ? raw.ativo : undefined,
    page: typeof raw.page === "string" ? raw.page : undefined,
  });
  const query = parsed.success
    ? parsed.data
    : { busca: undefined, ativo: "todos" as const, page: 1 };

  const ativoFiltro =
    query.ativo === "todos"
      ? ("todos" as const)
      : query.ativo === "true";

  const service = new ProtocoloService();
  const resultado = await service.listar(sessaoAuth, {
    busca: query.busca,
    ativo: ativoFiltro,
    page: query.page,
  });

  return (
    <div>
      <PageHeader
        title="Protocolos"
        actions={
          <Link href="/protocolos/novo">
            <Button type="button">Novo protocolo</Button>
          </Link>
        }
      >
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="min-w-[12rem] flex-1 space-y-1.5">
            <label htmlFor="busca" className="text-sm text-ink-muted">
              Busca
            </label>
            <Input
              id="busca"
              name="busca"
              defaultValue={query.busca ?? ""}
              placeholder="Nome, objetivo ou categoria"
            />
          </div>
          <div className="w-40 space-y-1.5">
            <label htmlFor="ativo" className="text-sm text-ink-muted">
              Status
            </label>
            <Select id="ativo" name="ativo" defaultValue={query.ativo}>
              <option value="todos">Todos</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </Select>
          </div>
          <Button type="submit" variant="secondary">
            Filtrar
          </Button>
        </form>
      </PageHeader>

      <ProtocolosTabela protocolos={resultado.items} />

      <p className="mt-4 text-sm text-ink-muted">
        {resultado.total} protocolo{resultado.total === 1 ? "" : "s"}
      </p>
    </div>
  );
}
