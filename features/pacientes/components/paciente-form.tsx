"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import type { Paciente } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  atualizarPacienteAction,
  criarPacienteAction,
  type PacienteActionState,
} from "@/features/pacientes/actions";
import { toInputDate } from "@/utils/date";
import { formatarCpf, formatarRg, formatarTelefone } from "@/utils/cpf";

const initialState: PacienteActionState = { ok: false };

type Props = {
  paciente?: Paciente;
};

function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint}
      </div>
      {children}
    </div>
  );
}

function telefoneEhWhatsappInicial(paciente?: Paciente): boolean {
  if (!paciente) return true;
  const tel = paciente.telefone?.replace(/\D/g, "") ?? "";
  const wa = paciente.whatsapp?.replace(/\D/g, "") ?? "";
  if (!tel && !wa) return true;
  if (tel && wa && tel === wa) return true;
  if (tel && !wa) return true;
  return false;
}

export function PacienteForm({ paciente }: Props) {
  const editing = Boolean(paciente);
  const action = editing ? atualizarPacienteAction : criarPacienteAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [cpf, setCpf] = useState(paciente ? formatarCpf(paciente.cpf) : "");
  const [rg, setRg] = useState(paciente?.rg ? formatarRg(paciente.rg) : "");
  const [telefone, setTelefone] = useState(
    paciente?.telefone ? formatarTelefone(paciente.telefone) : "",
  );
  const [whatsapp, setWhatsapp] = useState(
    paciente?.whatsapp ? formatarTelefone(paciente.whatsapp) : "",
  );
  const [telefoneEmergencia, setTelefoneEmergencia] = useState(
    paciente?.contato_emergencia_telefone
      ? formatarTelefone(paciente.contato_emergencia_telefone)
      : "",
  );
  const [mesmoWhatsapp, setMesmoWhatsapp] = useState(
    telefoneEhWhatsappInicial(paciente),
  );

  const whatsappEnviado = useMemo(
    () => (mesmoWhatsapp ? telefone : whatsapp),
    [mesmoWhatsapp, telefone, whatsapp],
  );

  return (
    <form action={formAction} className="space-y-8">
      {paciente ? <input type="hidden" name="id" value={paciente.id} /> : null}
      <input type="hidden" name="whatsapp" value={whatsappEnviado} />

      {state.message ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">Dados cadastrais</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome completo *" htmlFor="nome">
            <Input
              id="nome"
              name="nome"
              required
              defaultValue={paciente?.nome ?? ""}
            />
          </Field>
          <Field label="CPF *" htmlFor="cpf">
            <Input
              id="cpf"
              name="cpf"
              required
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatarCpf(e.target.value))}
              maxLength={14}
            />
          </Field>
          <Field label="RG" htmlFor="rg">
            <Input
              id="rg"
              name="rg"
              autoComplete="off"
              placeholder="00.000.000-0"
              value={rg}
              onChange={(e) => setRg(formatarRg(e.target.value))}
              maxLength={12}
            />
          </Field>
          <Field label="Sexo" htmlFor="sexo">
            <Select
              id="sexo"
              name="sexo"
              defaultValue={paciente?.sexo ?? "nao_informado"}
            >
              <option value="nao_informado">Não informado</option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="outro">Outro</option>
            </Select>
          </Field>
          <Field label="Data de nascimento *" htmlFor="data_nascimento">
            <Input
              id="data_nascimento"
              name="data_nascimento"
              type="date"
              required
              defaultValue={
                paciente ? toInputDate(paciente.data_nascimento) : ""
              }
            />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select
              id="status"
              name="status"
              defaultValue={paciente?.status ?? "em_tratamento"}
            >
              <option value="em_tratamento">Em tratamento</option>
              <option value="alta">Alta</option>
            </Select>
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">Contato</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Telefone"
            htmlFor="telefone"
            hint={
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-ink-muted">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-border accent-[var(--primary)]"
                  checked={mesmoWhatsapp}
                  onChange={(e) => setMesmoWhatsapp(e.target.checked)}
                />
                Este número é WhatsApp?
              </label>
            }
          >
            <Input
              id="telefone"
              name="telefone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              maxLength={15}
            />
          </Field>

          {!mesmoWhatsapp ? (
            <Field label="WhatsApp" htmlFor="whatsapp_visivel">
              <Input
                id="whatsapp_visivel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatarTelefone(e.target.value))}
                maxLength={15}
              />
            </Field>
          ) : (
            <div className="hidden md:block" aria-hidden />
          )}

          <Field label="E-mail" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={paciente?.email ?? ""}
            />
          </Field>
          <Field label="Endereço" htmlFor="endereco">
            <Input
              id="endereco"
              name="endereco"
              defaultValue={paciente?.endereco ?? ""}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">Clínico / anamnese rápida</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Diagnóstico" htmlFor="diagnostico">
            <Textarea
              id="diagnostico"
              name="diagnostico"
              defaultValue={paciente?.diagnostico ?? ""}
            />
          </Field>
          <Field label="Objetivo do tratamento" htmlFor="objetivo_tratamento">
            <Textarea
              id="objetivo_tratamento"
              name="objetivo_tratamento"
              defaultValue={paciente?.objetivo_tratamento ?? ""}
            />
          </Field>
          <Field label="Medicamentos" htmlFor="medicamentos">
            <Textarea
              id="medicamentos"
              name="medicamentos"
              defaultValue={paciente?.medicamentos ?? ""}
            />
          </Field>
          <Field label="Alergias" htmlFor="alergias">
            <Textarea
              id="alergias"
              name="alergias"
              defaultValue={paciente?.alergias ?? ""}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Histórico médico" htmlFor="historico_medico">
              <Textarea
                id="historico_medico"
                name="historico_medico"
                defaultValue={paciente?.historico_medico ?? ""}
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Observações" htmlFor="observacoes">
              <Textarea
                id="observacoes"
                name="observacoes"
                defaultValue={paciente?.observacoes ?? ""}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">Contato de emergência</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Nome" htmlFor="contato_emergencia_nome">
            <Input
              id="contato_emergencia_nome"
              name="contato_emergencia_nome"
              defaultValue={paciente?.contato_emergencia_nome ?? ""}
            />
          </Field>
          <Field label="Telefone" htmlFor="contato_emergencia_telefone">
            <Input
              id="contato_emergencia_telefone"
              name="contato_emergencia_telefone"
              inputMode="tel"
              placeholder="(00) 00000-0000"
              value={telefoneEmergencia}
              onChange={(e) =>
                setTelefoneEmergencia(formatarTelefone(e.target.value))
              }
              maxLength={15}
            />
          </Field>
          <Field label="Parentesco" htmlFor="contato_emergencia_parentesco">
            <Input
              id="contato_emergencia_parentesco"
              name="contato_emergencia_parentesco"
              defaultValue={paciente?.contato_emergencia_parentesco ?? ""}
            />
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Salvando…"
            : editing
              ? "Salvar alterações"
              : "Cadastrar paciente"}
        </Button>
        <Link
          href={paciente ? `/pacientes/${paciente.id}` : "/pacientes"}
          className="inline-flex h-10 items-center rounded-lg px-4 text-sm text-ink-muted transition hover:bg-surface hover:text-ink"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
