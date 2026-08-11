"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/utils/cn";

type Props = {
  /** Conteúdo explicativo (texto curto, sem markdown HTML complexo). */
  children: ReactNode;
  /** Rótulo acessível do botão */
  label?: string;
  className?: string;
  /** Alinha o painel à esquerda ou direita do botão */
  align?: "start" | "end";
};

/**
 * Ajuda sob demanda: hover (desktop) ou clique/toque.
 * Mantém a UI limpa — o texto não compete com a tarefa.
 */
export function HelpTip({
  children,
  label = "Mais informações",
  className,
  align = "start",
}: Props) {
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, [clearClose]);

  const openNow = useCallback(() => {
    clearClose();
    setOpen(true);
  }, [clearClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open]);

  useEffect(() => () => clearClose(), [clearClose]);

  return (
    <span
      ref={rootRef}
      className={cn("relative inline-flex align-middle", className)}
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center rounded-full",
          "transition duration-150 ease-out motion-reduce:transition-none",
          "hover:bg-surface-raised hover:text-ink",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          open && "bg-surface-raised text-ink",
        )}
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        onFocus={openNow}
        onBlur={scheduleClose}
      >
        <HelpCircle className="size-4" aria-hidden />
      </button>

      <span
        id={id}
        role="tooltip"
        className={cn(
          "absolute top-full z-50 mt-1.5 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-border",
          "bg-surface-raised px-3 py-2.5 text-left text-xs leading-relaxed text-ink shadow-lg",
          "transition duration-150 ease-out motion-reduce:transition-none",
          align === "end" ? "right-0" : "left-0",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-0.5 opacity-0",
        )}
        onMouseEnter={openNow}
        onMouseLeave={scheduleClose}
      >
        {children}
      </span>
    </span>
  );
}
