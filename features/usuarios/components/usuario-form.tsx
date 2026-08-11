"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MaskedInput } from "@/components/ui/masked-input";
import {
  atualizarUsuarioAction,
  criarUsuarioAction,
  type UsuarioActionState,
} from "@/features/usuarios/actions";

const initialState: UsuarioActionState = { ok: false };

type UsuarioInicial = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  perfil: "administrador" | "fisioterapeuta" | "recepcao";
  ativo: boolean;
};

type Props = {
  usuario?: UsuarioInicial;
};

export function UsuarioForm({ usuario }: Props) {
  const editing = Boolean(usuario);
  const action = editing ? atualizarUsuarioAction : criarUsuarioAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {usuario ? <input type="hidden" name="id" value={usuario.id} /> : null}

      {state.message ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            name="nome"
            required
            defaultValue={usuario?.nome ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            disabled={editing}
            defaultValue={usuario?.email ?? ""}
          />
          {editing ? (
            <p className="text-xs text-ink-subtle">
              E-mail não pode ser alterado aqui.
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefone">Telefone</Label>
          <MaskedInput
            id="telefone"
            name="telefone"
            mask="telefone"
            defaultValue={usuario?.telefone}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="perfil">Perfil *</Label>
          <Select
            id="perfil"
            name="perfil"
            required
            defaultValue={usuario?.perfil ?? "fisioterapeuta"}
          >
            <option value="administrador">Administrador</option>
            <option value="fisioterapeuta">Fisioterapeuta</option>
            <option value="recepcao">Recepção</option>
          </Select>
        </div>
        {!editing ? (
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="senha">Senha inicial *</Label>
            <Input
              id="senha"
              name="senha"
              type="password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="ativo">Status</Label>
            <Select
              id="ativo"
              name="ativo"
              defaultValue={usuario?.ativo ? "true" : "false"}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </Select>
          </div>
        )}
        {!editing ? <input type="hidden" name="ativo" value="true" /> : null}
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : editing ? "Salvar" : "Criar usuário"}
        </Button>
        <Link
          href={usuario ? `/usuarios/${usuario.id}` : "/usuarios"}
          className="inline-flex h-10 items-center rounded-lg px-4 text-sm text-ink-muted hover:bg-surface hover:text-ink"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
