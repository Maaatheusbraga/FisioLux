"use client";

import Link from "next/link";
import type { Paciente } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { excluirPacienteAction } from "@/features/pacientes/actions";
import { formatarCpf, formatarTelefoneExibicao } from "@/utils/cpf";
import { calcularIdade, formatarDataBr } from "@/utils/date";

type Props = {
  paciente: Paciente;
};

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-3 last:border-0 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-sm text-ink-subtle">{label}</dt>
      <dd className="text-sm text-ink sm:text-right">{value?.trim() || "—"}</dd>
    </div>
  );
}

export function PacienteDetalhe({ paciente }: Props) {
  const idade = calcularIdade(paciente.data_nascimento);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={
            paciente.status === "alta"
              ? "border-accent/30 text-accent"
              : "border-primary/30 text-primary"
          }
        >
          {paciente.status === "alta" ? "Alta" : "Em tratamento"}
        </Badge>
        <span className="text-sm text-ink-muted">
          {idade} anos · nasc. {formatarDataBr(paciente.data_nascimento)}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface-raised p-5">
          <h2 className="text-sm font-semibold text-ink">Cadastro</h2>
          <dl className="mt-2">
            <Row label="CPF" value={formatarCpf(paciente.cpf)} />
            <Row label="RG" value={paciente.rg} />
            <Row label="Sexo" value={paciente.sexo.replaceAll("_", " ")} />
            <Row label="Telefone" value={formatarTelefoneExibicao(paciente.telefone)} />
            <Row label="WhatsApp" value={formatarTelefoneExibicao(paciente.whatsapp)} />
            <Row label="E-mail" value={paciente.email} />
            <Row label="Endereço" value={paciente.endereco} />
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-surface-raised p-5">
          <h2 className="text-sm font-semibold text-ink">Clínico</h2>
          <dl className="mt-2">
            <Row label="Diagnóstico" value={paciente.diagnostico} />
            <Row label="Objetivo" value={paciente.objetivo_tratamento} />
            <Row label="Medicamentos" value={paciente.medicamentos} />
            <Row label="Alergias" value={paciente.alergias} />
            <Row label="Histórico médico" value={paciente.historico_medico} />
            <Row label="Observações" value={paciente.observacoes} />
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-surface-raised p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">
            Contato de emergência
          </h2>
          <dl className="mt-2 grid gap-0 sm:grid-cols-3 sm:gap-6">
            <Row label="Nome" value={paciente.contato_emergencia_nome} />
            <Row
              label="Telefone"
              value={formatarTelefoneExibicao(paciente.contato_emergencia_telefone)}
            />
            <Row
              label="Parentesco"
              value={paciente.contato_emergencia_parentesco}
            />
          </dl>
        </section>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Link href={`/pacientes/${paciente.id}/editar`}>
          <Button type="button">Editar</Button>
        </Link>
        <Link href="/pacientes">
          <Button type="button" variant="secondary">
            Voltar à lista
          </Button>
        </Link>
        <form
          action={excluirPacienteAction}
          className="sm:ml-auto"
          onSubmit={(e) => {
            if (
              !confirm(
                `Excluir logicamente o paciente ${paciente.nome}? O histórico permanece.`,
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={paciente.id} />
          <Button type="submit" variant="danger">
            Excluir
          </Button>
        </form>
      </div>
    </div>
  );
}
