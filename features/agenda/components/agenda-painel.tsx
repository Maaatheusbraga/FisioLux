"use client";

import { useActionState, useEffect, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarPlus, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PacienteBuscaField } from "@/features/pacientes/components/paciente-busca-field";
import {
  atualizarAgendaEventoAction,
  criarAgendaEventoAction,
  excluirAgendaEventoAction,
  sincronizarAgendaAction,
  type AgendaActionState,
} from "@/features/agenda/actions";
import {
  adicionarHorasDateTimeLocalBr,
  formatarHoraBr,
  toInputDateTimeLocalBr,
} from "@/utils/date";

type EventoItem = {
  id: string;
  titulo: string;
  descricao: string | null;
  inicio: Date | string;
  fim: Date | string;
  paciente: { id: string; nome: string } | null;
  usuario: { id: string; nome: string } | null;
};

type Props = {
  conectado: boolean;
  eventos: EventoItem[];
  diaReferencia: string;
  embedSrc?: string;
};

const initialState: AgendaActionState = { ok: false };

function AgendaModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface-raised p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agenda-modal-title"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="agenda-modal-title" className="text-sm font-semibold text-ink">
            {title}
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function AgendaPainel({
  conectado,
  eventos,
  diaReferencia,
  embedSrc,
}: Props) {
  const router = useRouter();
  const [criando, setCriando] = useState(false);
  const [inicioNovo, setInicioNovo] = useState("");
  const [fimNovo, setFimNovo] = useState("");
  const [fimNovoManual, setFimNovoManual] = useState(false);

  const [criarState, criarAction, criarPending] = useActionState(
    criarAgendaEventoAction,
    initialState,
  );
  const [editando, setEditando] = useState<EventoItem | null>(null);
  const [editState, editAction, editPending] = useActionState(
    atualizarAgendaEventoAction,
    initialState,
  );
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [syncPending, startSync] = useTransition();
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  function abrirCriar() {
    setInicioNovo("");
    setFimNovo("");
    setFimNovoManual(false);
    setCriando(true);
  }

  function aoAlterarInicioNovo(valor: string) {
    setInicioNovo(valor);
    if (!fimNovoManual && valor) {
      try {
        setFimNovo(adicionarHorasDateTimeLocalBr(valor, 1));
      } catch {
        // valor incompleto enquanto digita
      }
    }
  }

  useEffect(() => {
    if (criarState.ok) {
      router.refresh();
      setCriando(false);
      setInicioNovo("");
      setFimNovo("");
      setFimNovoManual(false);
    }
  }, [criarState.ok, router]);

  useEffect(() => {
    if (editState.ok) {
      router.refresh();
      setEditando(null);
    }
  }, [editState.ok, router]);

  function sincronizar() {
    startSync(async () => {
      try {
        const res = await sincronizarAgendaAction();
        setSyncMsg(res.message ?? null);
        if (res.ok) router.refresh();
      } catch {
        setSyncMsg("Não foi possível sincronizar. Tente novamente.");
      }
    });
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este evento no Google Calendar?")) return;
    setExcluindoId(id);
    const res = await excluirAgendaEventoAction(id);
    setSyncMsg(res.message ?? null);
    setExcluindoId(null);
    if (res.ok) router.refresh();
    if (editando?.id === id) setEditando(null);
  }

  return (
    <div className="space-y-4">
      {!conectado ? (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <p className="text-ink">
            Para criar eventos e vincular pacientes, conecte o Google Calendar em{" "}
            <Link href="/configuracoes" className="font-medium text-primary underline">
              Configurações
            </Link>
            .
          </p>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {conectado ? (
          <>
            <Button type="button" size="sm" onClick={abrirCriar}>
              <CalendarPlus className="mr-1.5 h-4 w-4" />
              Novo evento
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={syncPending}
              onClick={sincronizar}
            >
              <RefreshCw
                className={`mr-1.5 h-4 w-4 ${syncPending ? "animate-spin" : ""}`}
              />
              {syncPending ? "Sincronizando…" : "Sincronizar"}
            </Button>
          </>
        ) : null}
        {criarState.message && !criando ? (
          <span
            className={
              criarState.ok
                ? "text-xs text-primary"
                : "text-xs text-danger"
            }
          >
            {criarState.message}
          </span>
        ) : null}
        {syncMsg ? (
          <span className="text-xs text-ink-subtle">{syncMsg}</span>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        {embedSrc ? (
          <section className="order-1 overflow-hidden rounded-xl border border-border bg-surface-raised xl:order-none">
            <iframe
              src={embedSrc}
              title="Agenda embed"
              className="h-[68vh] min-h-[480px] w-full"
              style={{ border: 0 }}
              loading="lazy"
            />
          </section>
        ) : (
          <section className="order-1 flex h-[68vh] min-h-[480px] items-center justify-center rounded-xl border border-dashed border-border bg-surface-raised p-6 text-center text-sm text-ink-muted xl:order-none">
            Configure a URL de incorporação do Google Calendar em Configurações
            para exibir o calendário aqui.
          </section>
        )}

        <section className="order-2 rounded-xl border border-border bg-surface-raised p-4 xl:order-none xl:max-h-[68vh] xl:overflow-y-auto">
          <h2 className="text-sm font-semibold text-ink">Eventos do dia</h2>
          <p className="mt-0.5 text-xs text-ink-subtle">{diaReferencia}</p>

          {eventos.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">
              {conectado
                ? "Nenhum evento hoje. Use Novo evento ou sincronize."
                : "Conecte o Google Calendar para listar eventos."}
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {eventos.map((ev) => (
                <li key={ev.id} className="flex items-start gap-2 py-3 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{ev.titulo}</p>
                    <p className="text-xs text-ink-subtle">
                      {formatarHoraBr(ev.inicio)} – {formatarHoraBr(ev.fim)}
                    </p>
                    {ev.paciente ? (
                      <Link
                        href={`/pacientes/${ev.paciente.id}`}
                        className="mt-0.5 inline-block text-xs text-primary hover:underline"
                      >
                        {ev.paciente.nome}
                      </Link>
                    ) : null}
                    {ev.usuario ? (
                      <p className="mt-0.5 text-xs text-ink-subtle">
                        Criado por {ev.usuario.nome}
                      </p>
                    ) : null}
                  </div>
                  {conectado ? (
                    <div className="flex shrink-0 gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditando(ev)}
                        aria-label="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={excluindoId === ev.id}
                        onClick={() => excluir(ev.id)}
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-danger" />
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {criando ? (
        <AgendaModal title="Novo evento" onClose={() => setCriando(false)}>
          {criarState.message ? (
            <p
              className={
                criarState.ok
                  ? "mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
                  : "mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
              }
            >
              {criarState.message}
            </p>
          ) : null}
          <form action={criarAction} className="grid gap-4">
            <PacienteBuscaField />
            <div className="space-y-1.5">
              <Label htmlFor="titulo_novo">Título *</Label>
              <Input id="titulo_novo" name="titulo" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="inicio_novo">Início *</Label>
                <Input
                  id="inicio_novo"
                  name="inicio"
                  type="datetime-local"
                  required
                  value={inicioNovo}
                  onChange={(e) => aoAlterarInicioNovo(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fim_novo">Término *</Label>
                <Input
                  id="fim_novo"
                  name="fim"
                  type="datetime-local"
                  required
                  value={fimNovo}
                  onChange={(e) => {
                    setFimNovo(e.target.value);
                    setFimNovoManual(true);
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-ink-subtle">
              O término sugere +1 h após o início; altere se a duração for outra.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="descricao_novo">Descrição</Label>
              <Textarea id="descricao_novo" name="descricao" rows={2} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={criarPending}>
                {criarPending ? "Criando…" : "Criar no Google Calendar"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCriando(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </AgendaModal>
      ) : null}

      {editando ? (
        <AgendaModal title="Editar evento" onClose={() => setEditando(null)}>
          {editState.message ? (
            <p
              className={
                editState.ok
                  ? "mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
                  : "mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
              }
            >
              {editState.message}
            </p>
          ) : null}
          <form action={editAction} className="grid gap-4">
            <input type="hidden" name="id" value={editando.id} />
            <PacienteBuscaField
              pacienteFixo={editando.paciente}
              name="paciente_id"
            />
            {!editando.paciente ? (
              <p className="text-xs text-ink-subtle">
                Busque um paciente para vincular (opcional).
              </p>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="titulo_edit">Título *</Label>
              <Input
                id="titulo_edit"
                name="titulo"
                required
                defaultValue={editando.titulo}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="inicio_edit">Início *</Label>
                <Input
                  id="inicio_edit"
                  name="inicio"
                  type="datetime-local"
                  required
                  defaultValue={toInputDateTimeLocalBr(editando.inicio)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fim_edit">Término *</Label>
                <Input
                  id="fim_edit"
                  name="fim"
                  type="datetime-local"
                  required
                  defaultValue={toInputDateTimeLocalBr(editando.fim)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descricao_edit">Descrição</Label>
              <Textarea
                id="descricao_edit"
                name="descricao"
                rows={2}
                defaultValue={editando.descricao ?? ""}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={editPending}>
                {editPending ? "Salvando…" : "Salvar alterações"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditando(null)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </AgendaModal>
      ) : null}
    </div>
  );
}
