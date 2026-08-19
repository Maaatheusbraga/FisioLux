"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import {
  excluirAvaliacaoAction,
  excluirEvolucaoAction,
  excluirPlanoAction,
  reabrirTratamentoAction,
} from "@/features/prontuario/actions";
import { formatarDataBr } from "@/utils/date";
import { ehRecoveryAvaliacao } from "@/lib/validations/avaliacao-musculoesqueletica";

type UsuarioRef = { id: string; nome: string };

type Props = {
  paciente: {
    id: string;
    nome: string;
    status: "em_tratamento" | "alta";
  };
  avaliacoes: {
    id: string;
    tipo: "inicial" | "periodica";
    data_avaliacao: Date;
    diagnostico_fisioterapeutico: string | null;
    dados_complementares?: unknown;
    usuario: UsuarioRef;
  }[];
  planos: {
    id: string;
    data_plano: Date;
    objetivos: string | null;
    previsao_sessoes: number | null;
    usuario: UsuarioRef;
  }[];
  evolucoes: {
    id: string;
    data_evolucao: Date;
    descricao: string;
    escala_dor: number | null;
    usuario: UsuarioRef;
    sessao: { id: string; realizado_em: Date } | null;
  }[];
  altas: {
    id: string;
    data_alta: Date;
    motivo: string | null;
    data_reabertura: Date | null;
    usuario: UsuarioRef;
  }[];
};

function Secao({
  title,
  actionHref,
  actionLabel,
  children,
  empty,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <details open className="group border-b border-border last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center gap-3 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">{title}</span>
        </span>
        {actionHref && actionLabel ? (
          <Link href={actionHref} onClick={(e) => e.stopPropagation()}>
            <Button type="button" size="sm" variant="secondary">
              {actionLabel}
            </Button>
          </Link>
        ) : null}
      </summary>
      <div className="pb-4">
        {empty ? (
          <p className="text-sm text-ink-muted">Nenhum registro.</p>
        ) : (
          children
        )}
      </div>
    </details>
  );
}

function ItemRow({
  titulo,
  meta,
  editarHref,
  onExcluir,
}: {
  titulo: string;
  meta: string;
  editarHref: string;
  onExcluir?: {
    action: (fd: FormData) => Promise<void>;
    id: string;
    pacienteId: string;
  };
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-medium text-ink">{titulo}</p>
        <p className="text-xs text-ink-subtle">{meta}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={editarHref}>
          <Button type="button" size="sm" variant="ghost">
            Editar
          </Button>
        </Link>
        {onExcluir ? (
          <ConfirmForm
            action={onExcluir.action}
            title="Excluir registro"
            message="Excluir logicamente este registro?"
            confirmLabel="Excluir"
          >
            <input type="hidden" name="id" value={onExcluir.id} />
            <input
              type="hidden"
              name="paciente_id"
              value={onExcluir.pacienteId}
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="text-danger"
            >
              Excluir
            </Button>
          </ConfirmForm>
        ) : null}
      </div>
    </div>
  );
}

export function ProntuarioPainel({
  paciente,
  avaliacoes,
  planos,
  evolucoes,
  altas,
}: Props) {
  const base = `/pacientes/${paciente.id}/prontuario`;
  const emAlta = paciente.status === "alta";

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Badge
            className={
              emAlta
                ? "border-accent/30 text-accent"
                : "border-primary/30 text-primary"
            }
          >
            {emAlta ? "Alta" : "Em tratamento"}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`${base}/avaliacao/nova`}>
            <Button type="button" size="sm">
              Nova avaliação
            </Button>
          </Link>
          {emAlta ? (
            <ConfirmForm
              action={reabrirTratamentoAction}
              title="Reabrir tratamento"
              message="Reabrir o tratamento deste paciente?"
              confirmLabel="Reabrir"
              danger={false}
            >
              <input type="hidden" name="paciente_id" value={paciente.id} />
              <Button type="submit" size="sm" variant="secondary">
                Reabrir tratamento
              </Button>
            </ConfirmForm>
          ) : (
            <Link href={`${base}/alta/nova`}>
              <Button type="button" size="sm" variant="secondary">
                Registrar alta
              </Button>
            </Link>
          )}
        </div>
      </section>

      <div className="rounded-xl border border-border bg-surface-raised px-4">
      <Secao
        title="Avaliações musculoesqueléticas"
        actionHref={`${base}/avaliacao/nova`}
        actionLabel="Nova avaliação"
        empty={avaliacoes.length === 0}
      >
        {avaliacoes.map((a) => (
          <ItemRow
            key={a.id}
            titulo={`${formatarDataBr(a.data_avaliacao)} · ${a.tipo === "inicial" ? "Inicial" : "Periódica"}${ehRecoveryAvaliacao(a.dados_complementares) ? " · Recovery" : ""}`}
            meta={`${a.usuario.nome}${a.diagnostico_fisioterapeutico ? ` · ${a.diagnostico_fisioterapeutico}` : ""}`}
            editarHref={`${base}/avaliacao/${a.id}/editar`}
            onExcluir={{
              action: excluirAvaliacaoAction,
              id: a.id,
              pacienteId: paciente.id,
            }}
          />
        ))}
      </Secao>

      <Secao
        title="Planos terapêuticos"
        actionHref={`${base}/plano/novo`}
        actionLabel="Novo plano"
        empty={planos.length === 0}
      >
        {planos.map((p) => (
          <ItemRow
            key={p.id}
            titulo={formatarDataBr(p.data_plano)}
            meta={`${p.usuario.nome}${p.previsao_sessoes != null ? ` · ${p.previsao_sessoes} sessões` : ""}${p.objetivos ? ` · ${p.objetivos}` : ""}`}
            editarHref={`${base}/plano/${p.id}/editar`}
            onExcluir={{
              action: excluirPlanoAction,
              id: p.id,
              pacienteId: paciente.id,
            }}
          />
        ))}
      </Secao>

      <Secao
        title="Evoluções"
        actionHref={`${base}/evolucao/nova`}
        actionLabel="Nova evolução"
        empty={evolucoes.length === 0}
      >
        {evolucoes.map((e) => (
          <ItemRow
            key={e.id}
            titulo={`${formatarDataBr(e.data_evolucao)}${e.escala_dor != null ? ` · dor ${e.escala_dor}/10` : ""}`}
            meta={`${e.usuario.nome} · ${e.descricao}`}
            editarHref={`${base}/evolucao/${e.id}/editar`}
            onExcluir={{
              action: excluirEvolucaoAction,
              id: e.id,
              pacienteId: paciente.id,
            }}
          />
        ))}
      </Secao>

      <Secao title="Altas" empty={altas.length === 0}>
        {altas.map((a) => (
          <div
            key={a.id}
            className="border-b border-border py-3 text-sm last:border-0"
          >
            <p className="font-medium text-ink">
              {formatarDataBr(a.data_alta)}
              {a.data_reabertura
                ? ` · reaberta em ${formatarDataBr(a.data_reabertura)}`
                : " · ativa"}
            </p>
            <p className="text-xs text-ink-subtle">
              {a.usuario.nome}
              {a.motivo ? ` · ${a.motivo}` : ""}
            </p>
          </div>
        ))}
      </Secao>
      </div>
    </div>
  );
}
