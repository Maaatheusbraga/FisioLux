import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type ProtocoloItem = {
  id: string;
  nome: string;
  objetivo: string | null;
  tempo_estimado: number | null;
  categorias: string[];
  ativo: boolean;
};

type Props = {
  protocolos: ProtocoloItem[];
};

export function ProtocolosTabela({ protocolos }: Props) {
  if (protocolos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-14 text-center">
        <p className="text-sm font-medium text-ink">Nenhum protocolo encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface text-ink-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Nome</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">
              Objetivo
            </th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">
              Categorias
            </th>
            <th className="px-4 py-3 font-medium">Tempo</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {protocolos.map((p) => (
            <tr
              key={p.id}
              className="border-b border-border last:border-0 hover:bg-surface/60"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/protocolos/${p.id}`}
                  className="font-medium text-ink hover:text-primary"
                >
                  {p.nome}
                </Link>
              </td>
              <td className="hidden max-w-xs truncate px-4 py-3 text-ink-muted md:table-cell">
                {p.objetivo || "—"}
              </td>
              <td className="hidden px-4 py-3 text-ink-muted lg:table-cell">
                {p.categorias.length > 0 ? p.categorias.join(", ") : "—"}
              </td>
              <td className="px-4 py-3 text-ink-muted">
                {p.tempo_estimado != null ? `${p.tempo_estimado} min` : "—"}
              </td>
              <td className="px-4 py-3">
                <Badge
                  className={
                    p.ativo
                      ? "border-primary/30 text-primary"
                      : "border-border text-ink-subtle"
                  }
                >
                  {p.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
