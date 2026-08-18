"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buscarPacientesAction,
  type PacienteBuscaItem,
} from "@/features/pacientes/actions";
import { formatarCpf } from "@/utils/cpf";
import { cn } from "@/utils/cn";

type Props = {
  /** Paciente já definido (ficha do paciente ou edição) — campo bloqueado. */
  pacienteFixo?: { id: string; nome: string } | null;
  name?: string;
};

export function PacienteBuscaField({
  pacienteFixo = null,
  name = "paciente_id",
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PacienteBuscaItem | null>(null);
  const [results, setResults] = useState<PacienteBuscaItem[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (pacienteFixo) return;

    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setHint(q.length === 0 ? null : "Digite ao menos 2 caracteres…");
      return;
    }

    let cancelled = false;
    const handle = window.setTimeout(() => {
      startTransition(async () => {
        const items = await buscarPacientesAction(q);
        if (cancelled) return;
        setResults(items);
        setHint(items.length === 0 ? "Nenhum paciente encontrado." : null);
        setOpen(true);
      });
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [query, pacienteFixo]);

  if (pacienteFixo) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="paciente_fixo">Paciente *</Label>
        <input type="hidden" name={name} value={pacienteFixo.id} />
        <Input id="paciente_fixo" disabled value={pacienteFixo.nome} />
      </div>
    );
  }

  if (selected) {
    return (
      <div className="space-y-1.5">
        <Label>Paciente *</Label>
        <input type="hidden" name={name} value={selected.id} />
        <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-surface-raised px-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {selected.nome}
            </p>
            {selected.cpf ? (
              <p className="truncate text-xs text-ink-subtle">
                CPF {formatarCpf(selected.cpf)}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setQuery("");
              setResults([]);
              setHint(null);
            }}
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-surface hover:text-ink"
            aria-label="Trocar paciente"
          >
            <X className="size-3.5" aria-hidden />
            Trocar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5" ref={rootRef}>
      <Label htmlFor="paciente_busca">Paciente *</Label>
      <input type="hidden" name={name} value="" />
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
          aria-hidden
        />
        <Input
          id="paciente_busca"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Buscar por nome ou CPF…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0 || hint) setOpen(true);
          }}
          className="pl-9"
        />
        {open && (results.length > 0 || hint || pending) ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-surface-raised py-1 shadow-lg"
          >
            {pending ? (
              <li className="px-3 py-2 text-sm text-ink-muted">Buscando…</li>
            ) : null}
            {!pending && hint ? (
              <li className="px-3 py-2 text-sm text-ink-muted">{hint}</li>
            ) : null}
            {!pending &&
              results.map((p) => (
                <li key={p.id} role="option">
                  <button
                    type="button"
                    className={cn(
                      "flex w-full flex-col items-start px-3 py-2 text-left text-sm",
                      "hover:bg-surface focus-visible:bg-surface focus-visible:outline-none",
                    )}
                    onClick={() => {
                      setSelected(p);
                      setQuery("");
                      setResults([]);
                      setOpen(false);
                      setHint(null);
                    }}
                  >
                    <span className="font-medium text-ink">{p.nome}</span>
                    {p.cpf ? (
                      <span className="text-xs text-ink-subtle">
                        CPF {formatarCpf(p.cpf)}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
