"use client";

import Link from "next/link";
import type { Protocolo } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { excluirProtocoloAction } from "@/features/protocolos/actions";

type Props = {
  protocolo: Protocolo;
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

export function ProtocoloDetalhe({ protocolo }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={
            protocolo.ativo
              ? "border-primary/30 text-primary"
              : "border-border text-ink-subtle"
          }
        >
          {protocolo.ativo ? "Ativo" : "Inativo"}
        </Badge>
        {protocolo.tempo_estimado != null ? (
          <span className="text-sm text-ink-muted">
            {protocolo.tempo_estimado} min estimados
          </span>
        ) : null}
      </div>

      <section className="rounded-xl border border-border bg-surface-raised p-5">
        <dl>
          <Row label="Nome" value={protocolo.nome} />
          <Row label="Objetivo" value={protocolo.objetivo} />
          <Row label="Descrição" value={protocolo.descricao} />
          <Row
            label="Categorias"
            value={
              protocolo.categorias.length > 0
                ? protocolo.categorias.join(", ")
                : null
            }
          />
          <Row label="Observações" value={protocolo.observacoes} />
        </dl>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Link href={`/protocolos/${protocolo.id}/editar`}>
          <Button type="button">Editar</Button>
        </Link>
        <Link href="/protocolos">
          <Button type="button" variant="secondary">
            Voltar à lista
          </Button>
        </Link>
        <ConfirmForm
          action={excluirProtocoloAction}
          className="sm:ml-auto"
          title="Excluir protocolo"
          message="Excluir logicamente este protocolo? Ele deixará de aparecer nas sessões novas."
          confirmLabel="Excluir"
        >
          <input type="hidden" name="id" value={protocolo.id} />
          <Button type="submit" variant="danger">
            Excluir
          </Button>
        </ConfirmForm>
      </div>
    </div>
  );
}
