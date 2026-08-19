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
import { cn } from "@/utils/cn";
import {
  ClipboardList,
  Activity,
  TrendingUp,
  LogOut,
  type LucideIcon,
} from "lucide-react";

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

/** Nó da linha do tempo do prontuário */
function NoTimeline({
  icon: Icon,
  cor,
  isLast,
  children,
}: {
  icon: LucideIcon;
  cor: "primary" | "accent" | "muted";
  isLast: boolean;
  children: React.ReactNode;
}) {
  const iconStyle = {
    primary: "bg-primary text-primary-fg",
    accent: "bg-accent/15 text-accent border border-accent/30",
    muted: "bg-border text-ink-subtle",
  }[cor];

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast && (
        <span
          className="absolute left-[11px] top-7 h-[calc(100%-1.25rem)] w-px bg-border"
          aria-hidden
        />
      )}
      <span
        className={cn(
          "relative z-[1] mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          iconStyle,
        )}
        aria-hidden
      >
        <Icon className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}

/** Cabeçalho de cada seção do prontuário */
function SecaoHeader({
  title,
  actionHref,
  actionLabel,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-subtle">
        {title}
      </h3>
      {actionHref && actionLabel ? (
        <Link href={actionHref}>
          <Button type="button" size="sm" variant="secondary">
            {actionLabel}
          </Button>
        </Link>
      ) : null}
    </div>
  );
}

/** Ações de editar/excluir de um item */
function ItemAcoes({
  editarHref,
  onExcluir,
}: {
  editarHref: string;
  onExcluir?: {
    action: (fd: FormData) => Promise<void>;
    id: string;
    pacienteId: string;
  };
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      <Link href={editarHref}>
        <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs">
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
          <input type="hidden" name="paciente_id" value={onExcluir.pacienteId} />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-danger"
          >
            Excluir
          </Button>
        </ConfirmForm>
      ) : null}
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
    <div className="space-y-6">
      {/* Barra de status + ações globais */}
      <section className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <Badge
          className={
            emAlta
              ? "border-accent/30 text-accent"
              : "border-primary/30 text-primary"
          }
        >
          {emAlta ? "Alta" : "Em tratamento"}
        </Badge>
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

      {/* Avaliações */}
      <div>
        <SecaoHeader
          title="Avaliações"
          actionHref={`${base}/avaliacao/nova`}
          actionLabel="Nova avaliação"
        />
        {avaliacoes.length === 0 ? (
          <p className="pl-10 text-sm text-ink-muted">Nenhum registro.</p>
        ) : (
          <ol className="relative ml-1 space-y-0">
            {avaliacoes.map((a, i) => (
              <NoTimeline
                key={a.id}
                icon={ClipboardList}
                cor="primary"
                isLast={i === avaliacoes.length - 1}
              >
                <p className="text-xs text-ink-subtle">{formatarDataBr(a.data_avaliacao)}</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">
                  {a.tipo === "inicial" ? "Inicial" : "Periódica"}
                  {ehRecoveryAvaliacao(a.dados_complementares) ? " · Recovery" : ""}
                </p>
                {a.diagnostico_fisioterapeutico && (
                  <p className="mt-0.5 text-sm text-ink-muted text-pretty">
                    {a.diagnostico_fisioterapeutico}
                  </p>
                )}
                <p className="mt-1 text-xs text-ink-subtle">{a.usuario.nome}</p>
                <ItemAcoes
                  editarHref={`${base}/avaliacao/${a.id}/editar`}
                  onExcluir={{ action: excluirAvaliacaoAction, id: a.id, pacienteId: paciente.id }}
                />
              </NoTimeline>
            ))}
          </ol>
        )}
      </div>

      {/* Planos terapêuticos */}
      <div>
        <SecaoHeader
          title="Planos terapêuticos"
          actionHref={`${base}/plano/novo`}
          actionLabel="Novo plano"
        />
        {planos.length === 0 ? (
          <p className="pl-10 text-sm text-ink-muted">Nenhum registro.</p>
        ) : (
          <ol className="relative ml-1 space-y-0">
            {planos.map((p, i) => (
              <NoTimeline
                key={p.id}
                icon={TrendingUp}
                cor="primary"
                isLast={i === planos.length - 1}
              >
                <p className="text-xs text-ink-subtle">{formatarDataBr(p.data_plano)}</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">Plano terapêutico</p>
                {(p.previsao_sessoes != null || p.objetivos) && (
                  <p className="mt-0.5 text-sm text-ink-muted text-pretty">
                    {[
                      p.previsao_sessoes != null ? `${p.previsao_sessoes} sessões` : null,
                      p.objetivos,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                <p className="mt-1 text-xs text-ink-subtle">{p.usuario.nome}</p>
                <ItemAcoes
                  editarHref={`${base}/plano/${p.id}/editar`}
                  onExcluir={{ action: excluirPlanoAction, id: p.id, pacienteId: paciente.id }}
                />
              </NoTimeline>
            ))}
          </ol>
        )}
      </div>

      {/* Evoluções */}
      <div>
        <SecaoHeader
          title="Evoluções"
          actionHref={`${base}/evolucao/nova`}
          actionLabel="Nova evolução"
        />
        {evolucoes.length === 0 ? (
          <p className="pl-10 text-sm text-ink-muted">Nenhum registro.</p>
        ) : (
          <ol className="relative ml-1 space-y-0">
            {evolucoes.map((e, i) => (
              <NoTimeline
                key={e.id}
                icon={Activity}
                cor="primary"
                isLast={i === evolucoes.length - 1}
              >
                <p className="text-xs text-ink-subtle">{formatarDataBr(e.data_evolucao)}</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">
                  Evolução
                  {e.escala_dor != null ? ` · dor ${e.escala_dor}/10` : ""}
                </p>
                <p className="mt-0.5 text-sm text-ink-muted text-pretty">{e.descricao}</p>
                <p className="mt-1 text-xs text-ink-subtle">{e.usuario.nome}</p>
                <ItemAcoes
                  editarHref={`${base}/evolucao/${e.id}/editar`}
                  onExcluir={{ action: excluirEvolucaoAction, id: e.id, pacienteId: paciente.id }}
                />
              </NoTimeline>
            ))}
          </ol>
        )}
      </div>

      {/* Altas */}
      <div>
        <SecaoHeader title="Altas" />
        {altas.length === 0 ? (
          <p className="pl-10 text-sm text-ink-muted">Nenhum registro.</p>
        ) : (
          <ol className="relative ml-1 space-y-0">
            {altas.map((a, i) => (
              <NoTimeline
                key={a.id}
                icon={LogOut}
                cor="accent"
                isLast={i === altas.length - 1}
              >
                <p className="text-xs text-ink-subtle">{formatarDataBr(a.data_alta)}</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">
                  Alta
                  {a.data_reabertura
                    ? ` · reaberta em ${formatarDataBr(a.data_reabertura)}`
                    : " · ativa"}
                </p>
                {a.motivo && (
                  <p className="mt-0.5 text-sm text-ink-muted">{a.motivo}</p>
                )}
                <p className="mt-1 text-xs text-ink-subtle">{a.usuario.nome}</p>
              </NoTimeline>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
