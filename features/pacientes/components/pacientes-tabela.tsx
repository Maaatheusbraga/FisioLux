import Link from "next/link";
import type { Paciente } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatarCpf, formatarTelefoneExibicao } from "@/utils/cpf";
import { formatarDataBr } from "@/utils/date";

type Props = {
  pacientes: Paciente[];
};

function statusLabel(status: Paciente["status"]) {
  return status === "alta" ? "Alta" : "Em tratamento";
}

export function PacientesTabela({ pacientes }: Props) {
  if (pacientes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface/40 px-6 py-14 text-center">
        <p className="text-sm font-medium text-ink">Nenhum paciente encontrado</p>
        <p className="mt-1 text-sm text-ink-muted">
          Ajuste os filtros ou cadastre o primeiro paciente.
        </p>
        <Link
          href="/pacientes/novo"
          className="mt-4 inline-flex min-h-11 items-center text-sm text-accent hover:underline"
        >
          Novo paciente
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile-first: lista em cartões */}
      <ul className="space-y-2 md:hidden">
        {pacientes.map((p) => (
          <li key={p.id}>
            <Link
              href={`/pacientes/${p.id}`}
              className="block rounded-xl border border-border bg-surface-raised px-4 py-3 transition active:bg-surface"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{p.nome}</p>
                  {p.diagnostico ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-subtle">
                      {p.diagnostico}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-ink-muted">
                    {formatarTelefoneExibicao(p.whatsapp || p.telefone) ||
                      formatarCpf(p.cpf)}
                  </p>
                </div>
                <Badge
                  className={
                    p.status === "alta"
                      ? "shrink-0 border-accent/30 text-accent"
                      : "shrink-0 border-primary/30 text-primary"
                  }
                >
                  {statusLabel(p.status)}
                </Badge>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: tabela */}
      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">CPF</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Telefone
              </th>
              <th className="hidden px-4 py-3 font-medium xl:table-cell">
                Nascimento
              </th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border last:border-0 hover:bg-surface/60"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/pacientes/${p.id}`}
                    className="font-medium text-ink hover:text-primary"
                  >
                    {p.nome}
                  </Link>
                  {p.diagnostico ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-subtle">
                      {p.diagnostico}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                  {formatarCpf(p.cpf)}
                </td>
                <td className="hidden px-4 py-3 text-ink-muted lg:table-cell">
                  {formatarTelefoneExibicao(p.whatsapp || p.telefone)}
                </td>
                <td className="hidden px-4 py-3 text-ink-muted xl:table-cell">
                  {formatarDataBr(p.data_nascimento)}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      p.status === "alta"
                        ? "border-accent/30 text-accent"
                        : "border-primary/30 text-primary"
                    }
                  >
                    {statusLabel(p.status)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
