"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import {
  excluirArquivoAction,
  obterUrlAssinadaArquivoAction,
} from "@/features/arquivos/actions";
import { formatarDataHoraBr } from "@/utils/date";
import type { ArquivoListaItem } from "@/features/arquivos/components/arquivos-lista";

type Props = {
  midias: ArquivoListaItem[];
  pacienteId: string;
  redirectTo: string;
  emptyLabel?: string;
  emptyHint?: string;
  emptyCta?: { href: string; label: string };
};

function ehImagem(mime: string) {
  return mime.startsWith("image/");
}

/**
 * Galeria com preview via URL assinada (temporária).
 * Impacto: 1 request por mídia ao montar; imagens carregam o arquivo original
 * (não há thumbnail no storage nesta versão).
 */
export function MidiaGaleria({
  midias,
  pacienteId,
  redirectTo,
  emptyLabel = "Nenhuma foto ou vídeo",
  emptyHint = "Adicione uma ou mais mídias acima.",
  emptyCta,
}: Props) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [erros, setErros] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    async function carregar() {
      const next: Record<string, string> = {};
      const fails: Record<string, boolean> = {};
      await Promise.all(
        midias.map(async (m) => {
          const res = await obterUrlAssinadaArquivoAction(m.id);
          if (cancelled) return;
          if (res.ok) next[m.id] = res.url;
          else fails[m.id] = true;
        }),
      );
      if (!cancelled) {
        setUrls(next);
        setErros(fails);
      }
    }
    if (midias.length > 0) void carregar();
    else {
      setUrls({});
      setErros({});
    }
    return () => {
      cancelled = true;
    };
  }, [midias]);

  if (midias.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
        <p className="text-sm font-medium text-ink">{emptyLabel}</p>
        <p className="mt-1 text-sm text-ink-muted">{emptyHint}</p>
        {emptyCta ? (
          <div className="mt-4">
            <Link href={emptyCta.href}>
              <Button type="button" size="sm" variant="secondary">
                {emptyCta.label}
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {midias.map((m) => {
        const url = urls[m.id];
        const imagem = ehImagem(m.mime_type);
        return (
          <li
            key={m.id}
            className="overflow-hidden rounded-xl border border-border bg-surface-raised"
          >
            <div className="relative aspect-[4/3] bg-surface">
              {url && imagem ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={m.descricao || m.nome_original || "Foto"}
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : url && !imagem ? (
                <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center">
                  <p className="text-sm font-medium text-ink">Vídeo</p>
                  <p className="truncate text-xs text-ink-subtle">
                    {m.nome_original}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                  >
                    Reproduzir
                  </Button>
                </div>
              ) : erros[m.id] ? (
                <div className="flex size-full items-center justify-center text-xs text-ink-muted">
                  Preview indisponível
                </div>
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-ink-muted">
                  Carregando preview…
                </div>
              )}
            </div>
            <div className="space-y-2 p-3">
              <p className="text-xs text-ink-subtle">
                {formatarDataHoraBr(new Date(m.data_upload))}
              </p>
              <p className="truncate text-sm font-medium text-ink">
                {m.categoria === "video" ? "Vídeo" : "Foto"}
                {m.descricao ? ` · ${m.descricao}` : ""}
              </p>
              {m.sessao_id ? (
                <Link
                  href={`/sessoes/${m.sessao_id}`}
                  className="block text-xs text-primary hover:underline"
                >
                  Ver atendimento
                </Link>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={!url}
                  onClick={() => {
                    if (!url) return;
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                >
                  Abrir
                </Button>
                <ConfirmForm
                  action={excluirArquivoAction}
                  title="Excluir mídia"
                  message="Excluir esta mídia (vai para a lixeira)?"
                  confirmLabel="Excluir"
                >
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="paciente_id" value={pacienteId} />
                  {m.sessao_id ? (
                    <input type="hidden" name="sessao_id" value={m.sessao_id} />
                  ) : null}
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <Button type="submit" size="sm" variant="danger">
                    Excluir
                  </Button>
                </ConfirmForm>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
