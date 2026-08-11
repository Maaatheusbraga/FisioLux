import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { labelTipoEvento } from "@/config/timeline";
import { formatarDataHoraBr } from "@/utils/date";
import type { categoria_arquivo, tipo_evento_timeline } from "@prisma/client";

export type TimelineEventoView = {
  id: string;
  tipo: tipo_evento_timeline;
  descricao: string;
  ocorrido_em: Date;
  usuario: { id: string; nome: string; perfil: string };
  arquivo: {
    id: string;
    categoria: categoria_arquivo;
    descricao: string | null;
    nome_original: string | null;
    mime_type: string;
    deleted_at: Date | null;
  } | null;
};

type Cta = { href: string; label: string; variant?: "primary" | "secondary" };

type Props = {
  eventos: TimelineEventoView[];
  /** CTAs quando a timeline está vazia (sem filtros) */
  emptyCtas?: Cta[];
  emptyHint?: string;
};

export function TimelineLista({
  eventos,
  emptyCtas,
  emptyHint,
}: Props) {
  if (eventos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-14 text-center">
        <p className="text-sm font-medium text-ink">Nada na Timeline ainda</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
          {emptyHint ??
            "A Timeline só mostra o histórico. Para registrar atendimento do dia, use Atendimentos; texto clínico estruturado fica no Prontuário."}
        </p>
        {emptyCtas && emptyCtas.length > 0 ? (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {emptyCtas.map((cta) => (
              <Link key={cta.href} href={cta.href}>
                <Button
                  type="button"
                  size="sm"
                  variant={cta.variant === "secondary" ? "secondary" : "primary"}
                >
                  {cta.label}
                </Button>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <ol className="relative ml-3 space-y-0 border-l border-border md:ml-4">
      {eventos.map((evento) => (
        <li key={evento.id} className="relative pb-8 pl-6 last:pb-0">
          <span
            className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-bg"
            aria-hidden
          />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/25 text-primary">
                {labelTipoEvento(evento.tipo)}
              </Badge>
              <time
                dateTime={evento.ocorrido_em.toISOString()}
                className="text-xs text-ink-subtle"
              >
                {formatarDataHoraBr(evento.ocorrido_em)}
              </time>
            </div>
            <p className="text-sm text-ink">{evento.descricao}</p>
            <p className="text-xs text-ink-muted">
              Responsável:{" "}
              <span className="text-ink">{evento.usuario.nome}</span>
            </p>
            {evento.arquivo && !evento.arquivo.deleted_at ? (
              <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-ink-muted">
                Arquivo:{" "}
                <span className="text-ink">
                  {evento.arquivo.nome_original ||
                    evento.arquivo.descricao ||
                    evento.arquivo.categoria}
                </span>
                <span className="text-ink-subtle">
                  {" "}
                  · {evento.arquivo.categoria.replaceAll("_", " ")}
                </span>
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
