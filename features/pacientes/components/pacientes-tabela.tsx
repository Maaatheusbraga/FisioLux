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
          className="mt-4 inline-flex text-sm text-accent hover:underline"
        >
          Novo paciente
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface text-ink-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Nome</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">CPF</th>
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
              <td className="hidden px-4 py-3 font-mono text-xs text-ink-muted md:table-cell">
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
  );
}
