"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  loginAction,
  type AuthActionState,
} from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = { ok: false };

type Props = {
  redirectTo?: string;
  resetOk?: boolean;
};

export function LoginForm({ redirectTo = "/dashboard", resetOk }: Props) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      {resetOk ? (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          Senha atualizada. Entre com a nova senha.
        </p>
      ) : null}

      {state.message ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
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
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="senha">Senha</Label>
          <Link
            href="/recuperar-senha"
            className="text-xs text-accent transition hover:underline"
          >
            Esqueci a senha
          </Link>
        </div>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
