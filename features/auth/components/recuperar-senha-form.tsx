"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  recuperarSenhaAction,
  type AuthActionState,
} from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = { ok: false };

export function RecuperarSenhaForm() {
  const [state, formAction, pending] = useActionState(
    recuperarSenhaAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            state.ok
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@clinica.com"
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Enviando…" : "Enviar link de recuperação"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        <Link href="/login" className="text-accent hover:underline">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
