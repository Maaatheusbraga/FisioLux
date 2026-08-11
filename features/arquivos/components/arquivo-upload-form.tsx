"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { Camera, FlipHorizontal2, FolderOpen, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { HelpTip } from "@/components/ui/help-tip";
import { PacienteBuscaField } from "@/features/pacientes/components/paciente-busca-field";
import {
  uploadArquivoAction,
  type ArquivoActionState,
} from "@/features/arquivos/actions";
import { MAX_ARQUIVOS_POR_ENVIO } from "@/config/arquivos";
import { normalizarFotoClinica } from "@/utils/image-orientacao";

const initialState: ArquivoActionState = { ok: false };

type CategoriaOpt = { value: string; label: string };
type FonteArquivo = "galeria" | "camera";

type Props = {
  categorias: CategoriaOpt[];
  pacienteFixo?: { id: string; nome: string } | null;
  sessaoId?: string;
  redirectTo?: string;
  /** documentos = módulo Arquivos; midia = paciente/sessão */
  modo?: "documentos" | "midia";
};

type PreviewLocal = { id: string; file: File; url: string };

export function ArquivoUploadForm({
  categorias,
  pacienteFixo = null,
  sessaoId,
  redirectTo,
  modo = "documentos",
}: Props) {
  const [state, formAction, pending] = useActionState(
    uploadArquivoAction,
    initialState,
  );
  const [categoria, setCategoria] = useState(categorias[0]?.value ?? "");
  const [fonte, setFonte] = useState<FonteArquivo>("galeria");
  const [previews, setPreviews] = useState<PreviewLocal[]>([]);
  const [abrirPicker, setAbrirPicker] = useState(false);
  const [processando, setProcessando] = useState(false);
  /** Câmera do celular costuma entregar a foto espelhada; desfazemos por padrão. */
  const [corrigirEspelho, setCorrigirEspelho] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dataTransferRef = useRef<DataTransfer | null>(null);
  const rawCameraFilesRef = useRef<File[]>([]);
  const campoId = useId();

  const ehMidia = modo === "midia";
  const ehVideo = ehMidia && categoria === "video";
  const multiplo = ehMidia && fonte === "galeria" && !ehVideo;

  const accept = ehVideo
    ? "video/*"
    : ehMidia || fonte === "camera"
      ? "image/*"
      : "image/*,application/pdf,.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";

  useEffect(() => {
    if (!abrirPicker) return;
    inputRef.current?.click();
    setAbrirPicker(false);
  }, [abrirPicker, fonte, categoria]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sincronizarInput(files: File[]) {
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    dataTransferRef.current = dt;
    if (inputRef.current) {
      inputRef.current.files = dt.files;
    }
  }

  function limparArquivos() {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
    dataTransferRef.current = null;
    rawCameraFilesRef.current = [];
    if (inputRef.current) inputRef.current.value = "";
  }

  function escolherFonte(proxima: FonteArquivo) {
    setFonte(proxima);
    limparArquivos();
    if (proxima === "camera") setCorrigirEspelho(true);
    setAbrirPicker(true);
  }

  function montarPreviews(files: File[]) {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    const next = files.map((file, i) => ({
      id: `${file.name}-${file.size}-${i}-${Date.now()}`,
      file,
      url: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : "",
    }));
    setPreviews(next);
    sincronizarInput(files);
  }

  async function onFilesChange(list: FileList | null) {
    if (!list || list.length === 0) {
      limparArquivos();
      return;
    }
    const lim = multiplo ? MAX_ARQUIVOS_POR_ENVIO : 1;
    const files = Array.from(list).slice(0, lim);

    if (fonte === "camera" && !ehVideo) {
      rawCameraFilesRef.current = files;
      setProcessando(true);
      try {
        const normalizados = await Promise.all(
          files.map((f) =>
            normalizarFotoClinica(f, { espelhar: corrigirEspelho }),
          ),
        );
        montarPreviews(normalizados);
      } finally {
        setProcessando(false);
      }
      return;
    }

    rawCameraFilesRef.current = [];
    montarPreviews(files);
  }

  async function alternarEspelho() {
    if (fonte !== "camera" || rawCameraFilesRef.current.length === 0) return;
    const proximo = !corrigirEspelho;
    setCorrigirEspelho(proximo);
    setProcessando(true);
    try {
      const normalizados = await Promise.all(
        rawCameraFilesRef.current.map((f) =>
          normalizarFotoClinica(f, { espelhar: proximo }),
        ),
      );
      montarPreviews(normalizados);
    } finally {
      setProcessando(false);
    }
  }

  function removerPreview(id: string) {
    const removido = previews.find((p) => p.id === id);
    if (removido?.url) URL.revokeObjectURL(removido.url);
    const next = previews.filter((p) => p.id !== id);
    setPreviews(next);
    sincronizarInput(next.map((p) => p.file));
    if (next.length === 0) rawCameraFilesRef.current = [];
  }

  return (
    <form action={formAction} className="space-y-4" encType="multipart/form-data">
      {sessaoId ? (
        <input type="hidden" name="sessao_id" value={sessaoId} />
      ) : null}
      {redirectTo ? (
        <input type="hidden" name="redirect_to" value={redirectTo} />
      ) : null}

      {state.message ? (
        <p
          className={
            state.ok
              ? "rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
              : "rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          }
        >
          {state.message}
        </p>
      ) : null}

      {ehMidia ? (
        <div className="flex justify-end">
          <HelpTip label="Várias fotos" align="end">
            Na galeria você pode selecionar várias fotos de uma vez (até{" "}
            {MAX_ARQUIVOS_POR_ENVIO}). Pela câmera, uma por vez — envie e tire a
            próxima. Fotos da câmera são corrigidas automaticamente (orientação
            e espelhamento).
          </HelpTip>
        </div>
      ) : null}

      <PacienteBuscaField pacienteFixo={pacienteFixo} />

      <div className="space-y-1.5">
        <Label htmlFor="categoria">{ehMidia ? "Tipo *" : "Categoria *"}</Label>
        <Select
          id="categoria"
          name="categoria"
          required
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value);
            limparArquivos();
          }}
        >
          {categorias.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Arquivo{multiplo ? "s" : ""} *</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={fonte === "galeria" && previews.length ? "primary" : "secondary"}
            size="sm"
            onClick={() => escolherFonte("galeria")}
          >
            <FolderOpen className="size-4" aria-hidden />
            {ehVideo
              ? "Escolher vídeo"
              : multiplo
                ? "Escolher fotos"
                : "Escolher arquivo"}
          </Button>
          <Button
            type="button"
            variant={fonte === "camera" && previews.length ? "primary" : "secondary"}
            size="sm"
            onClick={() => escolherFonte("camera")}
          >
            {ehVideo ? (
              <Video className="size-4" aria-hidden />
            ) : (
              <Camera className="size-4" aria-hidden />
            )}
            {ehVideo ? "Gravar vídeo" : "Tirar foto"}
          </Button>
        </div>

        <input
          key={`${fonte}-${categoria}-${multiplo ? "multi" : "single"}`}
          ref={inputRef}
          id={campoId}
          name="arquivo"
          type="file"
          required={previews.length === 0}
          multiple={multiplo}
          accept={accept}
          capture={fonte === "camera" ? "environment" : undefined}
          className="sr-only"
          onChange={(e) => void onFilesChange(e.target.files)}
        />

        {processando ? (
          <p className="text-sm text-ink-muted">Ajustando orientação da foto…</p>
        ) : null}

        {previews.length > 0 ? (
          <div className="space-y-2">
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {previews.map((p) => (
                <li
                  key={p.id}
                  className="relative overflow-hidden rounded-lg border border-border bg-surface"
                >
                  {p.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.url}
                      alt={p.file.name}
                      className="aspect-square size-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center p-2 text-center text-xs text-ink-muted">
                      {p.file.name}
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-bg/80 p-2 text-ink hover:bg-bg"
                    aria-label={`Remover ${p.file.name}`}
                    onClick={() => removerPreview(p.id)}
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            {fonte === "camera" && !ehVideo ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={processando}
                onClick={() => void alternarEspelho()}
              >
                <FlipHorizontal2 className="size-4" aria-hidden />
                {corrigirEspelho
                  ? "Desfazer correção de espelho"
                  : "Corrigir espelhamento"}
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border px-3 py-3 text-sm text-ink-muted">
            Use <strong className="text-ink">Escolher</strong> ou{" "}
            <strong className="text-ink">
              {ehVideo ? "Gravar vídeo" : "Tirar foto"}
            </strong>
            {multiplo ? ` — até ${MAX_ARQUIVOS_POR_ENVIO} de uma vez.` : "."}
          </div>
        )}
        <p className="text-xs text-ink-subtle">
          {ehMidia
            ? `Até 15 MB por foto (vídeos até 50 MB). ${
                multiplo
                  ? `Seleção múltipla na galeria (máx. ${MAX_ARQUIVOS_POR_ENVIO}).`
                  : "Câmera: uma por vez; espelhamento corrigido automaticamente."
              }`
            : "Até 15 MB. No celular, “Tirar foto” abre a câmera traseira."}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descricao">
          Descrição{categoria === "documento" ? " *" : ""}
          {ehMidia ? " (ângulo, região… — vale para todas deste envio)" : ""}
        </Label>
        <Textarea
          id="descricao"
          name="descricao"
          placeholder={
            categoria === "documento"
              ? "Obrigatório para Documento — descreva o conteúdo"
              : ehMidia
                ? "Ex.: joelho direito, vista anterior"
                : "Opcional"
          }
          required={categoria === "documento"}
        />
      </div>

      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={
          pending ||
          processando ||
          categorias.length === 0 ||
          previews.length === 0
        }
      >
        {pending
          ? "Enviando…"
          : ehMidia
            ? previews.length > 1
              ? `Registrar ${previews.length} mídias`
              : "Registrar mídia"
            : "Enviar arquivo"}
      </Button>
    </form>
  );
}
