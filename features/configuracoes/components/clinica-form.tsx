"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { MaskedInput } from "@/components/ui/masked-input";
import { useAvisoAcao } from "@/components/ui/toast";
import {
  atualizarClinicaAction,
  type ClinicaActionState,
} from "@/features/configuracoes/actions";

const initialState: ClinicaActionState = { ok: false };

type Props = {
  clinica: {
    nome: string;
    cnpj: string | null;
    telefone: string | null;
    email: string | null;
    endereco: string | null;
    ativa: boolean;
  };
};

export function ClinicaForm({ clinica }: Props) {
  const [state, formAction, pending] = useActionState(
    atualizarClinicaAction,
    initialState,
  );
  useAvisoAcao(state);

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <p
          className={
            state.ok
              ? "rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
              : "rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="nome">Nome da clínica *</Label>
          <Input
            id="nome"
            name="nome"
            required
            defaultValue={clinica.nome}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cnpj">CNPJ</Label>
          <MaskedInput
            id="cnpj"
            name="cnpj"
            mask="cnpj"
            defaultValue={clinica.cnpj}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefone">Telefone</Label>
          <MaskedInput
            id="telefone"
            name="telefone"
            mask="telefone"
            defaultValue={clinica.telefone}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={clinica.email ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ativa">Situação</Label>
          <Select
            id="ativa"
            name="ativa"
            defaultValue={clinica.ativa ? "true" : "false"}
          >
            <option value="true">Ativa</option>
            <option value="false">Inativa</option>
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Textarea
            id="endereco"
            name="endereco"
            defaultValue={clinica.endereco ?? ""}
          />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar configurações"}
      </Button>
    </form>
  );
}
