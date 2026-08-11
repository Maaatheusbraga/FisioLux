"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    return async (options) => {
      const message =
        typeof options === "string" ? options : options.message;
      return window.confirm(message);
    };
  }
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({ message: "" });
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(
    null,
  );

  const confirm = useCallback<ConfirmFn>((options) => {
    const normalized: ConfirmOptions =
      typeof options === "string" ? { message: options } : options;
    setOpts(normalized);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const fechar = useCallback(
    (valor: boolean) => {
      setOpen(false);
      resolver?.(valor);
      setResolver(null);
    },
    [resolver],
  );

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-surface-raised p-5 shadow-xl">
            <h2
              id="confirm-title"
              className="text-base font-semibold text-ink"
            >
              {opts.title ?? "Confirmar"}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">{opts.message}</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => fechar(false)}
              >
                {opts.cancelLabel ?? "Cancelar"}
              </Button>
              <Button
                type="button"
                variant={opts.danger ? "danger" : "primary"}
                onClick={() => fechar(true)}
              >
                {opts.confirmLabel ?? "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}
