"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Evolucao } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  atualizarEvolucaoAction,
  criarEvolucaoAction,
  type ProntuarioActionState,
} from "@/features/prontuario/actions";
import { toInputDate } from "@/utils/date";

const initialState: ProntuarioActionState = { ok: false };

type Props = {
  pacienteId: string;
  pacienteNome: string;
  evolucao?: Evolucao;
};

export function EvolucaoForm({ pacienteId, pacienteNome, evolucao }: Props) {
  const editing = Boolean(evolucao);
  const action = editing ? atualizarEvolucaoAction : criarEvolucaoAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const voltar = `/pacientes/${pacienteId}?aba=prontuario`;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="paciente_id" value={pacienteId} />
      {evolucao ? <input type="hidden" name="id" value={evolucao.id} /> : null}

      <p className="text-sm text-ink-muted">Paciente: {pacienteNome}</p>

      {state.message ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="data_evolucao">Data *</Label>
          <Input
            id="data_evolucao"
            name="data_evolucao"
            type="date"
            required
            defaultValue={
              evolucao
                ? toInputDate(evolucao.data_evolucao)
                : toInputDate(new Date())
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="escala_dor">Escala de dor (0–10)</Label>
          <Input
            id="escala_dor"
            name="escala_dor"
            type="number"
            min={0}
            max={10}
            defaultValue={evolucao?.escala_dor ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descricao">Descrição *</Label>
        <Textarea
          id="descricao"
          name="descricao"
          required
          rows={4}
          defaultValue={evolucao?.descricao ?? ""}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          rows={2}
          defaultValue={evolucao?.observacoes ?? ""}
        />
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : editing ? "Salvar" : "Registrar evolução"}
        </Button>
        <Link href={voltar}>
          <Button type="button" variant="secondary">
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  );
}
