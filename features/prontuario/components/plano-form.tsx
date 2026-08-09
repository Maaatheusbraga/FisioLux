"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { PlanoTerapeutico } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  atualizarPlanoAction,
  criarPlanoAction,
  type ProntuarioActionState,
} from "@/features/prontuario/actions";
import { toInputDate } from "@/utils/date";

const initialState: ProntuarioActionState = { ok: false };

type Props = {
  pacienteId: string;
  pacienteNome: string;
  plano?: PlanoTerapeutico;
};

export function PlanoForm({ pacienteId, pacienteNome, plano }: Props) {
  const editing = Boolean(plano);
  const action = editing ? atualizarPlanoAction : criarPlanoAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const voltar = `/pacientes/${pacienteId}?aba=prontuario`;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="paciente_id" value={pacienteId} />
      {plano ? <input type="hidden" name="id" value={plano.id} /> : null}

      <p className="text-sm text-ink-muted">Paciente: {pacienteNome}</p>

      {state.message ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="data_plano">Data *</Label>
          <Input
            id="data_plano"
            name="data_plano"
            type="date"
            required
            defaultValue={
              plano ? toInputDate(plano.data_plano) : toInputDate(new Date())
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="previsao_sessoes">Previsão de sessões</Label>
          <Input
            id="previsao_sessoes"
            name="previsao_sessoes"
            type="number"
            min={1}
            max={500}
            defaultValue={plano?.previsao_sessoes ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="frequencia_sugerida">Frequência sugerida</Label>
        <Input
          id="frequencia_sugerida"
          name="frequencia_sugerida"
          defaultValue={plano?.frequencia_sugerida ?? ""}
          placeholder="Ex.: 2x por semana"
        />
      </div>

      {(
        [
          ["objetivos", "Objetivos", plano?.objetivos],
          ["condutas", "Condutas", plano?.condutas],
          ["observacoes", "Observações", plano?.observacoes],
        ] as const
      ).map(([name, label, value]) => (
        <div key={name} className="space-y-1.5">
          <Label htmlFor={name}>{label}</Label>
          <Textarea id={name} name={name} rows={3} defaultValue={value ?? ""} />
        </div>
      ))}

      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : editing ? "Salvar" : "Criar plano"}
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
