"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  registrarAltaAction,
  type ProntuarioActionState,
} from "@/features/prontuario/actions";
import { toInputDate } from "@/utils/date";

const initialState: ProntuarioActionState = { ok: false };

type Props = {
  pacienteId: string;
  pacienteNome: string;
};

export function AltaForm({ pacienteId, pacienteNome }: Props) {
  const [state, formAction, pending] = useActionState(
    registrarAltaAction,
    initialState,
  );
  const voltar = `/pacientes/${pacienteId}?aba=prontuario`;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="paciente_id" value={pacienteId} />

      <p className="text-sm text-ink-muted">Paciente: {pacienteNome}</p>

      {state.message ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="data_alta">Data da alta *</Label>
        <Input
          id="data_alta"
          name="data_alta"
          type="date"
          required
          defaultValue={toInputDate(new Date())}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="motivo">Motivo</Label>
        <Input id="motivo" name="motivo" placeholder="Ex.: objetivos atingidos" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" rows={3} />
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={pending}>
          {pending ? "Registrando…" : "Registrar alta"}
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
