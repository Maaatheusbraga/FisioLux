"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Download } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HelpTip } from "@/components/ui/help-tip";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ArquivoUploadForm } from "@/features/arquivos/components/arquivo-upload-form";
import { MidiaGaleria } from "@/features/arquivos/components/midia-galeria";
import { obterUrlAssinadaArquivoAction } from "@/features/arquivos/actions";
import { formatarDataHoraBr } from "@/utils/date";
import type { ArquivoListaItem } from "@/features/arquivos/components/arquivos-lista";

type Props = {
  paciente: { id: string; nome: string };
  categorias: { value: string; label: string }[];
  midias: ArquivoListaItem[];
};

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem."));
    img.src = src;
  });
}

async function baixarComparacaoPng(opts: {
  antesUrl: string;
  depoisUrl: string;
  pacienteNome: string;
  slider: number;
}) {
  const [antes, depois] = await Promise.all([
    carregarImagem(opts.antesUrl),
    carregarImagem(opts.depoisUrl),
  ]);

  const w = Math.max(antes.naturalWidth, depois.naturalWidth, 800);
  const h = Math.round(
    Math.max(
      (antes.naturalHeight / antes.naturalWidth) * w,
      (depois.naturalHeight / depois.naturalWidth) * w,
    ),
  );

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h + 48;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível.");

  ctx.fillStyle = "#0f1211";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(antes, 0, 48, w, h);
  const corte = (opts.slider / 100) * w;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 48, corte, h);
  ctx.clip();
  ctx.drawImage(depois, 0, 48, w, h);
  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(corte, 48);
  ctx.lineTo(corte, 48 + h);
  ctx.stroke();

  ctx.fillStyle = "#e8eeec";
  ctx.font = "600 16px system-ui, sans-serif";
  ctx.fillText(`FisioLux · ${opts.pacienteNome}`, 16, 30);
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillStyle = "#9aaba5";
  ctx.fillText("Antes", 16, 48 + h - 12);
  ctx.fillText("Depois", w - 56, 48 + h - 12);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Não foi possível gerar o PNG.");

  const slug = opts.pacienteNome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `FISIOLUX-${slug || "paciente"}-comparacao.png`;
  a.click();
  URL.revokeObjectURL(a.href);
}

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
    setExportando(true);
    try {
      await baixarComparacaoPng({
        antesUrl,
        depoisUrl,
        pacienteNome: paciente.nome,
        slider,
      });
    } catch (error) {
      await ask({
        title: "Falha ao exportar",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível gerar a imagem. Verifique se as fotos carregaram.",
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
        <div className="mb-4 flex items-center gap-1.5">
          <h2 className="text-sm font-semibold text-ink">
            Registrar foto ou vídeo
          </h2>
          <HelpTip label="Sobre fotos e vídeos">
            Preferência: registrar no atendimento do dia. Na galeria, selecione
            várias fotos de uma vez. Documentos ficam na aba Documentos.
          </HelpTip>
        </div>
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
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-semibold text-ink">
                Comparar (antes × depois)
              </h2>
              <HelpTip label="Como comparar">
                Escolha duas fotos. Use o slider e baixe o PNG da comparação
                (útil para enviar fora do sistema).
              </HelpTip>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={!antesUrl || !depoisUrl || exportando || pending}
              onClick={() => void onExportar()}
            >
              <Download className="size-4" aria-hidden />
              {exportando ? "Gerando…" : "Baixar PNG"}
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
              className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90"
              style={{ left: `${slider}%` }}
            />
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
          emptyHint="Use o formulário acima ou registre no atendimento do dia."
          emptyCta={{
            href: `/sessoes/nova?paciente=${paciente.id}`,
            label: "Ir ao atendimento",
          }}
        />
      </section>
    </div>
  );
}
