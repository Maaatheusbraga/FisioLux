"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { excluirSessaoAction } from "@/features/sessoes/actions";
import { formatarDataHoraBr } from "@/utils/date";

type Props = {
  sessao: {
    id: string;
    paciente_id: string;
    realizado_em: Date;
    procedimentos: string | null;
    equipamentos: string | null;
    escala_dor: number | null;
    observacoes: string | null;
    status: "registrada" | "cancelada";
    paciente: { id: string; nome: string };
    profissional: { id: string; nome: string };
    protocolos: { protocolo: { id: string; nome: string } }[];
    arquivos: {
      id: string;
      categoria: string;
      nome_original: string | null;
      descricao: string | null;
    }[];
  };
};

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-3 last:border-0 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-sm text-ink-subtle">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm text-ink sm:text-right">
        {value?.trim() || "—"}
      </dd>
    </div>
  );
}

export function SessaoDetalhe({ sessao }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={
            sessao.status === "cancelada"
              ? "border-danger/30 text-danger"
              : "border-primary/30 text-primary"
          }
        >
          {sessao.status === "cancelada" ? "Cancelada" : "Registrada"}
        </Badge>
        <span className="text-sm text-ink-muted">
          {formatarDataHoraBr(sessao.realizado_em)}
        </span>
      </div>

      <section className="rounded-xl border border-border bg-surface-raised p-5">
        <dl>
          <Row label="Paciente" value={sessao.paciente.nome} />
          <Row label="Profissional" value={sessao.profissional.nome} />
          <Row
            label="Escala de dor"
            value={
              sessao.escala_dor != null ? `${sessao.escala_dor}/10` : null
            }
          />
          <Row label="Procedimentos" value={sessao.procedimentos} />
          <Row label="Equipamentos" value={sessao.equipamentos} />
          <Row label="Observações" value={sessao.observacoes} />
          <Row
            label="Protocolos"
            value={
              sessao.protocolos.length > 0
                ? sessao.protocolos.map((p) => p.protocolo.nome).join(", ")
                : null
            }
          />
        </dl>
      </section>

      <section className="rounded-xl border border-dashed border-border bg-surface/40 p-5">
        <h2 className="text-sm font-semibold text-ink">Anexos da sessão</h2>
        {sessao.arquivos.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">
            Nenhum arquivo vinculado. Upload de fotos/vídeos na Fase 10.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {sessao.arquivos.map((a) => (
              <li key={a.id} className="text-ink-muted">
                {a.nome_original || a.descricao || a.categoria}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Link href={`/sessoes/${sessao.id}/editar`}>
          <Button type="button">Editar</Button>
        </Link>
        <Link href={`/pacientes/${sessao.paciente_id}`}>
          <Button type="button" variant="secondary">
            Ver Timeline do paciente
          </Button>
        </Link>
        <form
          action={excluirSessaoAction}
          className="sm:ml-auto"
          onSubmit={(e) => {
            if (!confirm("Excluir logicamente esta sessão?")) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={sessao.id} />
          <input type="hidden" name="paciente_id" value={sessao.paciente_id} />
          <Button type="submit" variant="danger">
            Excluir
          </Button>
        </form>
      </div>
    </div>
  );
}
