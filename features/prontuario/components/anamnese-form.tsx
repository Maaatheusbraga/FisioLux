"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Anamnese } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  atualizarAnamneseAction,
  criarAnamneseAction,
  type ProntuarioActionState,
} from "@/features/prontuario/actions";
import { toInputDate } from "@/utils/date";

const initialState: ProntuarioActionState = { ok: false };

type Props = {
  pacienteId: string;
  pacienteNome: string;
  anamnese?: Anamnese;
};

export function AnamneseForm({ pacienteId, pacienteNome, anamnese }: Props) {
  const editing = Boolean(anamnese);
  const action = editing ? atualizarAnamneseAction : criarAnamneseAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const voltar = `/pacientes/${pacienteId}?aba=prontuario`;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="paciente_id" value={pacienteId} />
      {anamnese ? <input type="hidden" name="id" value={anamnese.id} /> : null}

      <p className="text-sm text-ink-muted">Paciente: {pacienteNome}</p>

      {state.message ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="data_anamnese">Data *</Label>
        <Input
          id="data_anamnese"
          name="data_anamnese"
          type="date"
          required
          defaultValue={
            anamnese
              ? toInputDate(anamnese.data_anamnese)
              : toInputDate(new Date())
          }
        />
      </div>

      {(
        [
          ["queixa_principal", "Queixa principal", anamnese?.queixa_principal],
          [
            "historia_doenca_atual",
            "História da doença atual",
            anamnese?.historia_doenca_atual,
          ],
          [
            "historico_familiar",
            "Histórico familiar",
            anamnese?.historico_familiar,
          ],
          ["historico_social", "Histórico social", anamnese?.historico_social],
          ["habitos_vida", "Hábitos de vida", anamnese?.habitos_vida],
          [
            "exames_complementares",
            "Exames complementares",
            anamnese?.exames_complementares,
          ],
          ["observacoes", "Observações", anamnese?.observacoes],
        ] as const
      ).map(([name, label, value]) => (
        <div key={name} className="space-y-1.5">
          <Label htmlFor={name}>{label}</Label>
          <Textarea
            id={name}
            name={name}
            rows={name === "observacoes" ? 2 : 3}
            defaultValue={value ?? ""}
          />
        </div>
      ))}

      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : editing ? "Salvar" : "Registrar anamnese"}
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
