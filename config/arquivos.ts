import type { CategoriaArquivo } from "@/types/dominio";
import type { categoria_arquivo } from "@prisma/client";

export const LABELS_CATEGORIA_ARQUIVO: Record<CategoriaArquivo, string> = {
  encaminhamento: "Encaminhamento",
  relatorio_medico: "Relatório médico",
  laudo: "Laudo",
  receita: "Receita",
  foto_antes: "Foto",
  foto_depois: "Foto",
  foto_evolucao: "Foto",
  video: "Vídeo",
  documento: "Documento",
};

/**
 * Documentos administrativos/clínicos de papel — módulo Arquivos e aba Arquivos.
 * Recepção pode enviar/ver.
 */
export const CATEGORIAS_DOCUMENTOS: readonly categoria_arquivo[] = [
  "encaminhamento",
  "relatorio_medico",
  "laudo",
  "receita",
  "documento",
] as const;

/**
 * Mídia de evolução — paciente (aba Fotos) e sessão.
 * Antes/depois é temporal (sessões no tempo), não categoria de upload.
 * `foto_antes` / `foto_depois` permanecem no enum só para legado.
 */
export const CATEGORIAS_MIDIA: readonly categoria_arquivo[] = [
  "foto_evolucao",
  "video",
  "foto_antes",
  "foto_depois",
] as const;

/** Opções de upload de mídia (sem forçar antes/depois). */
export const CATEGORIAS_MIDIA_UPLOAD: readonly categoria_arquivo[] = [
  "foto_evolucao",
  "video",
] as const;

/** @deprecated use CATEGORIAS_DOCUMENTOS */
export const CATEGORIAS_CADASTRAIS = CATEGORIAS_DOCUMENTOS;

/** @deprecated use CATEGORIAS_MIDIA */
export const CATEGORIAS_CLINICAS = CATEGORIAS_MIDIA;

export const TODAS_CATEGORIAS_ARQUIVO: readonly categoria_arquivo[] = [
  ...CATEGORIAS_DOCUMENTOS,
  ...CATEGORIAS_MIDIA,
] as const;

export type EscopoArquivo = "documentos" | "midia";

export function ehCategoriaDocumento(categoria: categoria_arquivo): boolean {
  return (CATEGORIAS_DOCUMENTOS as readonly string[]).includes(categoria);
}

export function ehCategoriaMidia(categoria: categoria_arquivo): boolean {
  return (CATEGORIAS_MIDIA as readonly string[]).includes(categoria);
}

/** Alias histórico. */
export function ehCategoriaCadastral(categoria: categoria_arquivo): boolean {
  return ehCategoriaDocumento(categoria);
}

export function labelCategoriaArquivo(categoria: string): string {
  return (
    LABELS_CATEGORIA_ARQUIVO[categoria as CategoriaArquivo] ??
    categoria.replaceAll("_", " ")
  );
}

export const LIMITE_UPLOAD_PADRAO = 15 * 1024 * 1024;
export const LIMITE_UPLOAD_VIDEO = 50 * 1024 * 1024;
export const URL_ASSINADA_SEGUNDOS = 60 * 15;
/** Máximo de arquivos por envio no formulário de mídia. */
export const MAX_ARQUIVOS_POR_ENVIO = 10;
