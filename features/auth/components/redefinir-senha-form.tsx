"use client";

import { useActionState } from "react";
import {
  redefinirSenhaAction,
  type AuthActionState,
} from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = { ok: false };

export function RedefinirSenhaForm() {
  const [state, formAction, pending] = useActionState(
    redefinirSenhaAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="senha">Nova senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmarSenha">Confirmar senha</Label>
        <Input
          id="confirmarSenha"
          name="confirmarSenha"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Salvando…" : "Salvar nova senha"}
      </Button>
    </form>
  );
}
