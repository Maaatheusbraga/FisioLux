import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatarDataHoraBr } from "@/utils/date";

type EventoItem = {
  id: string;
  titulo: string;
  descricao: string | null;
  inicio: Date | string;
  fim: Date | string;
};

type Props = {
  eventos: EventoItem[];
};

export function PacienteAgendaPainel({ eventos }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Agendamentos</h2>
          <p className="mt-1 text-xs text-ink-subtle">
            Todos os eventos do Google Calendar vinculados a este paciente.
          </p>
        </div>
        <Link href="/agenda">
          <Button type="button" variant="secondary" size="sm">
            Abrir agenda da clínica
          </Button>
        </Link>
      </div>

      {eventos.length === 0 ? (
        <section className="rounded-xl border border-dashed border-border bg-surface-raised p-8 text-center">
          <CalendarClock
            className="mx-auto mb-3 size-8 text-ink-subtle"
            aria-hidden
          />
          <p className="text-sm text-ink-muted">
            Nenhum agendamento vinculado a este paciente.
          </p>
          <p className="mt-1 text-xs text-ink-subtle">
            Novos compromissos podem ser criados na{" "}
            <Link href="/agenda" className="text-primary hover:underline">
              Agenda
            </Link>
            .
          </p>
        </section>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface-raised">
          {eventos.map((ev) => (
            <li key={ev.id} className="px-5 py-4">
              <p className="font-medium text-ink">{ev.titulo}</p>
              <p className="mt-1 text-xs text-ink-subtle">
                {formatarDataHoraBr(ev.inicio)} → {formatarDataHoraBr(ev.fim)}
              </p>
              {ev.descricao ? (
                <p className="mt-2 text-sm text-ink-muted whitespace-pre-wrap">
                  {ev.descricao}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {eventos.length > 0 ? (
        <p className="text-xs text-ink-subtle">
          {eventos.length} agendamento{eventos.length === 1 ? "" : "s"} vinculado
          {eventos.length === 1 ? "" : "s"}.
        </p>
      ) : null}
    </div>
  );
}
