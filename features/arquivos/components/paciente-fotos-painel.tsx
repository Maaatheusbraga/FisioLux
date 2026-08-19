"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Download } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ArquivoUploadForm } from "@/features/arquivos/components/arquivo-upload-form";
import { MidiaGaleria } from "@/features/arquivos/components/midia-galeria";
import { obterUrlAssinadaArquivoAction } from "@/features/arquivos/actions";
import { formatarDataHoraBr } from "@/utils/date";
import { baixarComparacaoPdf } from "@/utils/comparacao-pdf";
import type { ArquivoListaItem } from "@/features/arquivos/components/arquivos-lista";

type Props = {
  paciente: { id: string; nome: string };
  categorias: { value: string; label: string }[];
  midias: ArquivoListaItem[];
};

export function PacienteFotosPainel({
  paciente,
  categorias,
  midias,
}: Props) {
  const redirectTo = `/pacientes/${paciente.id}?aba=fotos`;
  const [pending, startTransition] = useTransition();
  const ask = useConfirm();
  const [items, setItems] = useState(midias);
  const [antesId, setAntesId] = useState("");
  const [depoisId, setDepoisId] = useState("");
  const [antesUrl, setAntesUrl] = useState<string | null>(null);
  const [depoisUrl, setDepoisUrl] = useState<string | null>(null);
  const [slider, setSlider] = useState(50);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    setItems(midias);
  }, [midias]);

  const fotos = useMemo(
    () => items.filter((m) => m.categoria !== "video"),
    [items],
  );

  useEffect(() => {
    if (fotos.length >= 2) {
      setAntesId((prev) => prev || fotos[fotos.length - 1]!.id);
      setDepoisId((prev) => prev || fotos[0]!.id);
    }
  }, [fotos]);

  function carregarPreview(id: string, lado: "antes" | "depois") {
    startTransition(async () => {
      const res = await obterUrlAssinadaArquivoAction(id);
      if (!res.ok) {
        await ask({
          title: "Não foi possível abrir",
          message: res.message,
          confirmLabel: "Ok",
          danger: false,
        });
        return;
      }
      if (lado === "antes") setAntesUrl(res.url);
      else setDepoisUrl(res.url);
    });
  }

  useEffect(() => {
    if (antesId) carregarPreview(antesId, "antes");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [antesId]);

  useEffect(() => {
    if (depoisId) carregarPreview(depoisId, "depois");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depoisId]);

  async function onExportar() {
    if (!antesUrl || !depoisUrl) return;
    const antesItem = fotos.find((f) => f.id === antesId);
    const depoisItem = fotos.find((f) => f.id === depoisId);
    setExportando(true);
    try {
      await baixarComparacaoPdf({
        antesUrl,
        depoisUrl,
        pacienteNome: paciente.nome,
        antesLegenda: antesItem
          ? formatarDataHoraBr(new Date(antesItem.data_upload))
          : undefined,
        depoisLegenda: depoisItem
          ? formatarDataHoraBr(new Date(depoisItem.data_upload))
          : undefined,
      });
    } catch (error) {
      await ask({
        title: "Falha ao exportar",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível gerar o PDF. Verifique se as fotos carregaram.",
        confirmLabel: "Ok",
        danger: false,
      });
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-surface-raised p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">
          Registrar foto ou vídeo
        </h2>
        <ArquivoUploadForm
          categorias={categorias}
          pacienteFixo={paciente}
          redirectTo={redirectTo}
          modo="midia"
        />
      </section>

      {fotos.length >= 2 ? (
        <section className="space-y-4 rounded-xl border border-border bg-surface-raised p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink">
              Comparar (antes × depois)
            </h2>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={!antesUrl || !depoisUrl || exportando || pending}
              onClick={() => void onExportar()}
            >
              <Download className="size-4" aria-hidden />
              {exportando ? "Gerando…" : "Baixar PDF"}
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-ink-subtle">Antes</label>
              <Select
                value={antesId}
                onChange={(e) => setAntesId(e.target.value)}
              >
                {fotos.map((f) => (
                  <option key={f.id} value={f.id}>
                    {formatarDataHoraBr(new Date(f.data_upload))}
                    {f.descricao ? ` — ${f.descricao}` : ""}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-ink-subtle">Depois</label>
              <Select
                value={depoisId}
                onChange={(e) => setDepoisId(e.target.value)}
              >
                {fotos.map((f) => (
                  <option key={f.id} value={f.id}>
                    {formatarDataHoraBr(new Date(f.data_upload))}
                    {f.descricao ? ` — ${f.descricao}` : ""}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-surface">
            {antesUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={antesUrl}
                alt="Antes"
                className="absolute inset-0 size-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-xs text-ink-muted">
                {pending ? "Carregando…" : "Sem preview"}
              </div>
            )}
            {depoisUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={depoisUrl}
                alt="Depois"
                className="absolute inset-0 size-full object-cover"
                crossOrigin="anonymous"
                style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}
              />
            ) : null}
            <div
              className="pointer-events-none absolute inset-y-0 w-px bg-ink"
              style={{ left: `${slider}%` }}
            >
              <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-raised text-[10px] font-medium text-ink">
                ⋮
              </span>
            </div>
          </div>
          <label className="mx-auto flex max-w-2xl items-center gap-3 text-xs text-ink-muted">
            Antes
            <input
              type="range"
              min={0}
              max={100}
              value={slider}
              onChange={(e) => setSlider(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
            Depois
          </label>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">
          Galeria no tempo ({items.length})
        </h2>
        <MidiaGaleria
          midias={items}
          pacienteId={paciente.id}
          redirectTo={redirectTo}
          emptyCta={{
            href: `/pacientes/${paciente.id}?aba=fotos`,
            label: "Adicionar foto",
          }}
        />
      </section>
    </div>
  );
}
