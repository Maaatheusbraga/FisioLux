"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, CircleAlert, X } from "lucide-react";
import { AVISO_COOKIE } from "@/lib/feedback/aviso-const";
import { cn } from "@/utils/cn";

type ToastTipo = "ok" | "erro";

type ToastItem = {
  id: number;
  tipo: ToastTipo;
  texto: string;
};

type ToastApi = {
  sucesso: (texto: string) => void;
  erro: (texto: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      sucesso: () => {},
      erro: () => {},
    };
  }
  return ctx;
}

/** Dispara toast quando uma server action devolve `{ ok, message }`. */
export function useAvisoAcao(state: { ok: boolean; message?: string }) {
  const toast = useToast();
  const visto = useRef<string | null>(null);

  useEffect(() => {
    if (!state.message) return;
    const chave = `${state.ok}:${state.message}`;
    if (visto.current === chave) return;
    visto.current = chave;
    if (state.ok) toast.sucesso(state.message);
    else toast.erro(state.message);
  }, [state.ok, state.message, toast]);
}

function lerCookie(nome: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${nome}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function apagarCookie(nome: string) {
  document.cookie = `${nome}=; path=/; max-age=0`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const push = useCallback((tipo: ToastTipo, texto: string) => {
    const limpo = texto.trim();
    if (!limpo) return;
    const id = ++seq.current;
    setItens((prev) => [...prev.slice(-2), { id, tipo, texto: limpo }]);
    window.setTimeout(() => {
      setItens((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      sucesso: (texto) => push("ok", texto),
      erro: (texto) => push("erro", texto),
    }),
    [push],
  );

  useEffect(() => {
    const bruto = lerCookie(AVISO_COOKIE);
    if (!bruto) return;
    apagarCookie(AVISO_COOKIE);
    try {
      const parsed = JSON.parse(bruto) as { t?: string; m?: string };
      if (parsed.m) {
        push(parsed.t === "erro" ? "erro" : "ok", parsed.m);
      }
    } catch {
      push("ok", bruto);
    }
  }, [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        {itens.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-lg",
              t.tipo === "ok"
                ? "border-primary/30 bg-surface-raised text-ink"
                : "border-danger/30 bg-surface-raised text-ink",
            )}
            role="status"
          >
            {t.tipo === "ok" ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            ) : (
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
            )}
            <p className="min-w-0 flex-1 text-sm">{t.texto}</p>
            <button
              type="button"
              className="shrink-0 rounded-md p-0.5 text-ink-subtle hover:text-ink"
              aria-label="Fechar aviso"
              onClick={() =>
                setItens((prev) => prev.filter((x) => x.id !== t.id))
              }
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
