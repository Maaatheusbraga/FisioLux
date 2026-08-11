"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  excluirArquivoAction,
  obterUrlAssinadaArquivoAction,
} from "@/features/arquivos/actions";
import { labelCategoriaArquivo } from "@/config/arquivos";
import { formatarDataHoraBr } from "@/utils/date";

export type ArquivoListaItem = {
  id: string;
  categoria: string;
  nome_original: string | null;
  descricao: string | null;
  mime_type: string;
  tamanho: number;
  data_upload: Date | string;
  paciente_id: string | null;
  sessao_id: string | null;
  paciente?: { id: string; nome: string } | null;
  usuario?: { id: string; nome: string } | null;
};

type Props = {
  arquivos: ArquivoListaItem[];
  mostrarPaciente?: boolean;
  redirectTo?: string;
  emptyLabel?: string;
  emptyHint?: string;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function ArquivosLista({
  arquivos,
  mostrarPaciente = false,
  redirectTo,
  emptyLabel = "Nenhum arquivo",
  emptyHint = "Envie o primeiro anexo deste contexto.",
}: Props) {
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();

  if (arquivos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
        <p className="text-sm font-medium text-ink">{emptyLabel}</p>
        <p className="mt-1 text-sm text-ink-muted">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <ul className="divide-y divide-border">
        {arquivos.map((a) => (
          <li
            key={a.id}
            className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-ink">
                  {a.nome_original || "Arquivo"}
                </p>
                <Badge className="border-border text-ink-muted">
                  {labelCategoriaArquivo(a.categoria)}
                </Badge>
              </div>
              <p className="text-xs text-ink-subtle">
                {formatarDataHoraBr(new Date(a.data_upload))} ·{" "}
                {formatBytes(a.tamanho)}
                {a.usuario?.nome ? ` · ${a.usuario.nome}` : ""}
                {mostrarPaciente && a.paciente?.nome
                  ? ` · ${a.paciente.nome}`
                  : ""}
              </p>
              {a.descricao ? (
                <p className="text-sm text-ink-muted">{a.descricao}</p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await obterUrlAssinadaArquivoAction(a.id);
                    if (!res.ok) {
                      await confirm({
                        title: "Não foi possível abrir",
                        message: res.message,
                        confirmLabel: "Ok",
                        danger: false,
                      });
                      return;
                    }
                    window.open(res.url, "_blank", "noopener,noreferrer");
                  });
                }}
              >
                Abrir
              </Button>
              <ConfirmForm
                action={excluirArquivoAction}
                title="Excluir arquivo"
                message="Excluir este arquivo (vai para a lixeira)?"
                confirmLabel="Excluir"
              >
                <input type="hidden" name="id" value={a.id} />
                {a.paciente_id ? (
                  <input
                    type="hidden"
                    name="paciente_id"
                    value={a.paciente_id}
                  />
                ) : null}
                {a.sessao_id ? (
                  <input type="hidden" name="sessao_id" value={a.sessao_id} />
                ) : null}
                {redirectTo ? (
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                ) : null}
                <Button type="submit" variant="danger" size="sm">
                  Excluir
                </Button>
              </ConfirmForm>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
