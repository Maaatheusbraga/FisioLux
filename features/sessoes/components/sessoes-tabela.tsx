import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatarDataHoraBr } from "@/utils/date";

type SessaoItem = {
  id: string;
  realizado_em: Date;
  status: "registrada" | "cancelada";
  escala_dor: number | null;
  paciente: { id: string; nome: string };
  profissional: { id: string; nome: string };
  protocolos: { protocolo: { id: string; nome: string } }[];
};

type Props = {
  sessoes: SessaoItem[];
  mostrarPaciente?: boolean;
};

export function SessoesTabela({ sessoes, mostrarPaciente = true }: Props) {
  if (sessoes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-14 text-center">
        <p className="text-sm font-medium text-ink">Nenhuma sessão encontrada</p>
        <p className="mt-1 text-sm text-ink-muted">
          Registre o primeiro atendimento clínico.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface text-ink-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Quando</th>
            {mostrarPaciente ? (
              <th className="px-4 py-3 font-medium">Paciente</th>
            ) : null}
            <th className="hidden px-4 py-3 font-medium md:table-cell">
              Profissional
            </th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">
              Protocolos
            </th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sessoes.map((s) => (
            <tr
              key={s.id}
              className="border-b border-border last:border-0 hover:bg-surface/60"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/sessoes/${s.id}`}
                  className="font-medium text-ink hover:text-primary"
                >
                  {formatarDataHoraBr(s.realizado_em)}
                </Link>
                {s.escala_dor != null ? (
                  <p className="text-xs text-ink-subtle">Dor {s.escala_dor}/10</p>
                ) : null}
              </td>
              {mostrarPaciente ? (
                <td className="px-4 py-3">
                  <Link
                    href={`/pacientes/${s.paciente.id}`}
                    className="text-ink-muted hover:text-ink"
                  >
                    {s.paciente.nome}
                  </Link>
                </td>
              ) : null}
              <td className="hidden px-4 py-3 text-ink-muted md:table-cell">
                {s.profissional.nome}
              </td>
              <td className="hidden px-4 py-3 text-ink-muted lg:table-cell">
                {s.protocolos.length > 0
                  ? s.protocolos.map((p) => p.protocolo.nome).join(", ")
                  : "—"}
              </td>
              <td className="px-4 py-3">
                <Badge
                  className={
                    s.status === "cancelada"
                      ? "border-danger/30 text-danger"
                      : "border-primary/30 text-primary"
                  }
                >
                  {s.status === "cancelada" ? "Cancelada" : "Registrada"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
