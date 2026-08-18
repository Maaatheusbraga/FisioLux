"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Protocolo } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  atualizarProtocoloAction,
  criarProtocoloAction,
  type ProtocoloActionState,
} from "@/features/protocolos/actions";

const initialState: ProtocoloActionState = { ok: false };

type Props = {
  protocolo?: Protocolo;
};

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function ProtocoloForm({ protocolo }: Props) {
  const editing = Boolean(protocolo);
  const action = editing ? atualizarProtocoloAction : criarProtocoloAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {protocolo ? <input type="hidden" name="id" value={protocolo.id} /> : null}

      {state.message ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome *" htmlFor="nome">
          <Input
            id="nome"
            name="nome"
            required
            defaultValue={protocolo?.nome ?? ""}
            placeholder="Ex.: RPG cervical"
          />
        </Field>
        <Field label="Tempo estimado (min)" htmlFor="tempo_estimado">
          <Input
            id="tempo_estimado"
            name="tempo_estimado"
            type="number"
            min={1}
            max={600}
            inputMode="numeric"
            defaultValue={protocolo?.tempo_estimado ?? ""}
            placeholder="45"
          />
        </Field>
      </div>

      <Field label="Objetivo" htmlFor="objetivo">
        <Textarea
          id="objetivo"
          name="objetivo"
          rows={2}
          defaultValue={protocolo?.objetivo ?? ""}
          placeholder="O que este protocolo busca alcançar"
        />
      </Field>

      <Field label="Descrição" htmlFor="descricao">
        <Textarea
          id="descricao"
          name="descricao"
          rows={3}
          defaultValue={protocolo?.descricao ?? ""}
          placeholder="Passos, condução clínica, materiais…"
        />
      </Field>

      <Field label="Categorias" htmlFor="categorias">
        <Input
          id="categorias"
          name="categorias"
          defaultValue={protocolo?.categorias?.join(", ") ?? ""}
          placeholder="Ortopedia, RPG"
        />
      </Field>

      <Field label="Observações" htmlFor="observacoes">
        <Textarea
          id="observacoes"
          name="observacoes"
          rows={2}
          defaultValue={protocolo?.observacoes ?? ""}
        />
      </Field>

      <Field label="Status" htmlFor="ativo">
        <Select
          id="ativo"
          name="ativo"
          defaultValue={protocolo?.ativo === false ? "false" : "true"}
        >
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </Select>
      </Field>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Salvando…"
            : editing
              ? "Salvar alterações"
              : "Criar protocolo"}
        </Button>
        <Link href={protocolo ? `/protocolos/${protocolo.id}` : "/protocolos"}>
          <Button type="button" variant="secondary">
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  );
}
