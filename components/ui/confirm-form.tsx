"use client";

import { useRef, type FormHTMLAttributes, type ReactNode } from "react";
import { useConfirm } from "@/components/ui/confirm-dialog";

type Props = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & {
  message: string;
  title?: string;
  confirmLabel?: string;
  danger?: boolean;
  children: ReactNode;
};

/** Intercepta submit com diálogo de confirmação (substitui window.confirm). */
export function ConfirmForm({
  message,
  title,
  confirmLabel,
  danger = true,
  children,
  ...props
}: Props) {
  const confirm = useConfirm();
  const liberado = useRef(false);

  return (
    <form
      {...props}
      onSubmit={(e) => {
        if (liberado.current) {
          liberado.current = false;
          return;
        }
        e.preventDefault();
        const form = e.currentTarget;
        void (async () => {
          const ok = await confirm({
            title,
            message,
            confirmLabel,
            danger,
          });
          if (!ok) return;
          liberado.current = true;
          form.requestSubmit();
        })();
      }}
    >
      {children}
    </form>
  );
}
