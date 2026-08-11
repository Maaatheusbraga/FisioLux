"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { HelpTip } from "@/components/ui/help-tip";
import { cn } from "@/utils/cn";

type ProtocoloOpt = { id: string; nome: string; tempo_estimado: number | null };

type Props = {
  protocolos: ProtocoloOpt[];
  selectedIds?: string[];
};

/**
 * Multi-seleção compacta com busca — evita lista longa de cards no formulário.
 */
export function ProtocoloPicker({ protocolos, selectedIds = [] }: Props) {
  const [q, setQ] = useState("");
  const [selecionados, setSelecionados] = useState<Set<string>>(
    () => new Set(selectedIds),
  );

  const filtrados = useMemo(() => {
    const termo = q.trim().toLowerCase();
    if (!termo) return protocolos;
    return protocolos.filter((p) => p.nome.toLowerCase().includes(termo));
  }, [protocolos, q]);

  function toggle(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (protocolos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-ink-muted">
        Nenhum protocolo cadastrado. Você pode registrar o atendimento sem
        vincular protocolos.
      </p>
    );
  }

  const selecionadosLista = protocolos.filter((p) => selecionados.has(p.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-semibold text-ink">Protocolos utilizados</p>
        <HelpTip label="Sobre protocolos">
          Busque pelo nome e marque os usados neste atendimento. Opcional.
        </HelpTip>
      </div>

      {/* inputs hidden para o FormData do parent */}
      {Array.from(selecionados).map((id) => (
        <input key={id} type="hidden" name="protocolo_ids" value={id} />
      ))}

      <Input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar protocolo pelo nome…"
        aria-label="Buscar protocolo"
        autoComplete="off"
      />

      {selecionadosLista.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selecionadosLista.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-ink transition hover:bg-primary/20"
              title="Remover"
            >
              {p.nome}
              <span aria-hidden className="text-ink-subtle">
                ×
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-subtle">Nenhum selecionado.</p>
      )}

      <ul
        className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border"
        role="listbox"
        aria-multiselectable
        aria-label="Protocolos"
      >
        {filtrados.length === 0 ? (
          <li className="px-3 py-4 text-center text-sm text-ink-muted">
            Nenhum protocolo com “{q.trim()}”.
          </li>
        ) : (
          filtrados.map((p) => {
            const marcado = selecionados.has(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={marcado}
                  onClick={() => toggle(p.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition",
                    marcado
                      ? "bg-primary/10 text-ink"
                      : "text-ink-muted hover:bg-surface-raised hover:text-ink",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border text-[10px]",
                      marcado
                        ? "border-primary bg-primary text-primary-fg"
                        : "border-border",
                    )}
                    aria-hidden
                  >
                    {marcado ? "✓" : ""}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {p.nome}
                  </span>
                  {p.tempo_estimado != null ? (
                    <span className="shrink-0 text-xs text-ink-subtle">
                      ~{p.tempo_estimado} min
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
