"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buscarPacientesAction,
  type PacienteBuscaItem,
} from "@/features/pacientes/actions";
import { formatarCpf } from "@/utils/cpf";

export function ProntuarioPacienteBusca() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PacienteBuscaItem[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
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
  }, [query]);

  return (
    <div ref={rootRef} className="relative max-w-xl space-y-1.5">
      <Label htmlFor="busca_prontuario">Buscar paciente</Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
        <Input
          id="busca_prontuario"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Nome ou CPF"
          className="pl-9"
          autoComplete="off"
        />
      </div>
      {hint ? <p className="text-xs text-ink-subtle">{hint}</p> : null}
      {pending ? (
        <p className="text-xs text-ink-subtle">Buscando…</p>
      ) : null}
      {open && results.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-surface-raised shadow-lg">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-surface"
                onClick={() => {
                  router.push(`/pacientes/${p.id}?aba=prontuario`);
                }}
              >
                <span className="font-medium text-ink">{p.nome}</span>
                <span className="text-xs text-ink-subtle">
                  {formatarCpf(p.cpf)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
