"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { PacienteBuscaField } from "@/features/pacientes/components/paciente-busca-field";
import {
  atualizarSessaoAction,
  criarSessaoAction,
  type SessaoActionState,
} from "@/features/sessoes/actions";

const initialState: SessaoActionState = { ok: false };

type ProtocoloOpt = { id: string; nome: string; tempo_estimado: number | null };
type ProfissionalOpt = { id: string; nome: string };

type SessaoInicial = {
  id: string;
  paciente_id: string;
  profissional_id: string;
  realizado_em: Date;
  procedimentos: string | null;
  equipamentos: string | null;
  escala_dor: number | null;
  observacoes: string | null;
  status: "registrada" | "cancelada";
  protocoloIds: string[];
  paciente: { id: string; nome: string };
};

type Props = {
  profissionais: ProfissionalOpt[];
  protocolos: ProtocoloOpt[];
  /** Quando a sessão nasce na ficha do paciente. */
  pacienteFixo?: { id: string; nome: string } | null;
  profissionalPadraoId?: string;
  sessao?: SessaoInicial;
};

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function SessaoForm({
  profissionais,
  protocolos,
  pacienteFixo = null,
  profissionalPadraoId,
  sessao,
}: Props) {
  const editing = Boolean(sessao);
  const action = editing ? atualizarSessaoAction : criarSessaoAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const selectedProtocolos = new Set(sessao?.protocoloIds ?? []);
  const pacienteBloqueado = sessao?.paciente ?? pacienteFixo ?? null;

  return (
    <form action={formAction} className="space-y-6">
      {sessao ? <input type="hidden" name="id" value={sessao.id} /> : null}

      {state.message ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <PacienteBuscaField pacienteFixo={pacienteBloqueado} />

        <div className="space-y-1.5">
          <Label htmlFor="profissional_id">Profissional *</Label>
          <Select
            id="profissional_id"
            name="profissional_id"
            required
            defaultValue={
              sessao?.profissional_id ?? profissionalPadraoId ?? ""
            }
          >
            <option value="" disabled>
              Selecione…
            </option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="realizado_em">Data e horário *</Label>
          <Input
            id="realizado_em"
            name="realizado_em"
            type="datetime-local"
            required
            defaultValue={
              sessao
                ? toDatetimeLocal(new Date(sessao.realizado_em))
                : toDatetimeLocal(new Date())
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
            step={1}
            defaultValue={sessao?.escala_dor ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            defaultValue={sessao?.status ?? "registrada"}
          >
            <option value="registrada">Registrada</option>
            <option value="cancelada">Cancelada</option>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="procedimentos">Procedimentos realizados</Label>
        <Textarea
          id="procedimentos"
          name="procedimentos"
          defaultValue={sessao?.procedimentos ?? ""}
          placeholder="Ex.: mobilização articular, alongamento…"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="equipamentos">Equipamentos</Label>
        <Textarea
          id="equipamentos"
          name="equipamentos"
          defaultValue={sessao?.equipamentos ?? ""}
          placeholder="Ex.: TENS, ultrassom…"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          defaultValue={sessao?.observacoes ?? ""}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-ink">
          Protocolos utilizados
        </legend>
        {protocolos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-ink-muted">
            Nenhum protocolo cadastrado ainda. O CRUD completo chega na Fase 8 —
            você já pode registrar a sessão sem protocolos.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {protocolos.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-raised"
              >
                <input
                  type="checkbox"
                  name="protocolo_ids"
                  value={p.id}
                  defaultChecked={selectedProtocolos.has(p.id)}
                  className="mt-0.5 accent-[var(--primary)]"
                />
                <span>
                  <span className="font-medium text-ink">{p.nome}</span>
                  {p.tempo_estimado != null ? (
                    <span className="block text-xs text-ink-subtle">
                      ~{p.tempo_estimado} min
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <div className="rounded-lg border border-border bg-surface/60 px-3 py-3 text-xs text-ink-muted">
        Fotos, vídeos e anexos da sessão entram na <strong>Fase 10</strong>{" "}
        (StorageService). A sessão já fica pronta para receber esses arquivos.
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Salvando…"
            : editing
              ? "Salvar sessão"
              : "Registrar sessão"}
        </Button>
        <Link
          href={
            sessao
              ? `/sessoes/${sessao.id}`
              : pacienteFixo
                ? `/pacientes/${pacienteFixo.id}`
                : "/sessoes"
          }
          className="inline-flex h-10 items-center rounded-lg px-4 text-sm text-ink-muted hover:bg-surface hover:text-ink"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
