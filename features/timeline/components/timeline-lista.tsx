import Link from "next/link";
import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { labelTipoEvento } from "@/config/timeline";
import { formatarDataHoraBr } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { categoria_arquivo, tipo_evento_timeline } from "@prisma/client";

export type TimelineEventoView = {
  id: string;
  tipo: tipo_evento_timeline;
  descricao: string;
  ocorrido_em: Date;
  paciente_id?: string;
  sessao_id?: string | null;
  avaliacao_id?: string | null;
  plano_terapeutico_id?: string | null;
  evolucao_id?: string | null;
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
  pacienteId?: string;
  emptyCtas?: Cta[];
};

function hrefEvento(evento: TimelineEventoView, pacienteId?: string) {
  const pid = pacienteId ?? evento.paciente_id;
  if (!pid) return null;
  if (evento.avaliacao_id) {
    return `/pacientes/${pid}/prontuario/avaliacao/${evento.avaliacao_id}/editar`;
  }
  if (evento.plano_terapeutico_id) {
    return `/pacientes/${pid}/prontuario/plano/${evento.plano_terapeutico_id}/editar`;
  }
  if (evento.evolucao_id) {
    return `/pacientes/${pid}/prontuario/evolucao/${evento.evolucao_id}/editar`;
  }
  if (evento.tipo === "alta_registrada" || evento.tipo === "avaliacao_criada") {
    return `/pacientes/${pid}?aba=prontuario`;
  }
  return null;
}

export function TimelineLista({
  eventos,
  pacienteId,
  emptyCtas,
}: Props) {
  if (eventos.length === 0) {
    return (
      <div className="px-1 py-12 text-center">
        <p className="text-sm font-medium text-ink">Nada na jornada ainda</p>
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
    <ol className="relative ml-1 space-y-0">
      {eventos.map((evento, index) => {
        const atual = index === 0;
        const href = hrefEvento(evento, pacienteId);
        const corpo = (
          <>
            <time
              dateTime={evento.ocorrido_em.toISOString()}
              className="text-xs text-ink-subtle"
            >
              {formatarDataHoraBr(evento.ocorrido_em)}
            </time>
            <p className="mt-0.5 text-sm font-semibold text-ink">
              {labelTipoEvento(evento.tipo)}
            </p>
            <p className="mt-0.5 text-sm text-ink-muted text-pretty">
              {evento.descricao}
            </p>
            <p className="mt-1 text-xs text-ink-subtle">{evento.usuario.nome}</p>
          </>
        );

        return (
          <li key={evento.id} className="relative flex gap-4 pb-8 last:pb-0">
            {index < eventos.length - 1 ? (
              <span
                className={cn(
                  "absolute left-[11px] top-7 h-[calc(100%-1.25rem)] w-px",
                  atual ? "bg-primary" : "bg-border",
                )}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "relative z-[1] mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                atual
                  ? "border-2 border-primary bg-bg text-primary"
                  : "bg-primary text-primary-fg",
              )}
              aria-hidden
            >
              {atual ? (
                <Clock className="h-3 w-3" strokeWidth={2.5} />
              ) : (
                <Check className="h-3 w-3" strokeWidth={2.5} />
              )}
            </span>
            {href ? (
              <Link
                href={href}
                className="min-w-0 flex-1 rounded-md py-0.5 transition hover:text-ink"
              >
                {corpo}
              </Link>
            ) : (
              <div className="min-w-0 flex-1">{corpo}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
