"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { HelpTip } from "@/components/ui/help-tip";
import {
  excluirAnamneseAction,
  excluirAvaliacaoAction,
  excluirEvolucaoAction,
  excluirPlanoAction,
  reabrirTratamentoAction,
} from "@/features/prontuario/actions";
import { formatarDataBr, formatarDataHoraBr } from "@/utils/date";

type UsuarioRef = { id: string; nome: string };

type Props = {
  paciente: {
    id: string;
    nome: string;
    status: "em_tratamento" | "alta";
  };
  /** Registros legados — criação descontinuada (use Avaliação). */
  anamneses: {
    id: string;
    data_anamnese: Date;
    queixa_principal: string | null;
    usuario: UsuarioRef;
  }[];
  avaliacoes: {
    id: string;
    tipo: "inicial" | "periodica";
    data_avaliacao: Date;
    diagnostico_fisioterapeutico: string | null;
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
  hint,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
  empty?: boolean;
  hint?: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface-raised p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {hint ? <p className="mt-0.5 text-xs text-ink-subtle">{hint}</p> : null}
        </div>
        {actionHref && actionLabel ? (
          <Link href={actionHref}>
            <Button type="button" size="sm" variant="secondary">
              {actionLabel}
            </Button>
          </Link>
        ) : null}
      </div>
      {empty ? (
        <p className="text-sm text-ink-muted">Nenhum registro ainda.</p>
      ) : (
        children
      )}
    </section>
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
  anamneses,
  avaliacoes,
  planos,
  evolucoes,
  altas,
}: Props) {
  const base = `/pacientes/${paciente.id}/prontuario`;
  const emAlta = paciente.status === "alta";

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
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
          <span className="text-sm text-ink-muted">
            Prontuário clínico · {paciente.nome}
          </span>
          <HelpTip label="Sobre o prontuário">
            Eixo clínico: avaliação → plano → evolução → alta. O atendimento do
            dia fica em Atendimentos; o histórico automático fica na Timeline.
          </HelpTip>
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

      <Secao
        title="Avaliações musculoesqueléticas"
        actionHref={`${base}/avaliacao/nova`}
        actionLabel="Nova avaliação"
        empty={avaliacoes.length === 0}
      >
        {avaliacoes.map((a) => (
          <ItemRow
            key={a.id}
            titulo={`${formatarDataBr(a.data_avaliacao)} · ${a.tipo === "inicial" ? "Inicial" : "Periódica"}`}
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
            meta={`${e.usuario.nome} · ${e.descricao}${e.sessao ? ` · sessão ${formatarDataHoraBr(e.sessao.realizado_em)}` : ""}`}
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

      {anamneses.length > 0 ? (
        <Secao
          title="Anamneses (legado)"
          hint="Criação descontinuada — novos intakes vão na Avaliação. Mantido só para registros antigos."
          empty={false}
        >
          {anamneses.map((a) => (
            <ItemRow
              key={a.id}
              titulo={formatarDataBr(a.data_anamnese)}
              meta={`${a.usuario.nome}${a.queixa_principal ? ` · ${a.queixa_principal}` : ""}`}
              editarHref={`${base}/anamnese/${a.id}/editar`}
              onExcluir={{
                action: excluirAnamneseAction,
                id: a.id,
                pacienteId: paciente.id,
              }}
            />
          ))}
        </Secao>
      ) : null}
    </div>
  );
}
