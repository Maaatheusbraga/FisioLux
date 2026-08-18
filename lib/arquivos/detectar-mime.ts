import { AppError } from "@/lib/errors/app-error";
import type { categoria_arquivo } from "@prisma/client";

export type MimePermitido =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/msword"
  | "video/mp4"
  | "video/webm"
  | "video/quicktime";

const MIME_FOTO: readonly MimePermitido[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MIME_VIDEO: readonly MimePermitido[] = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const MIME_DOCUMENTO: readonly MimePermitido[] = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

function ascii(buffer: Buffer, start: number, length: number) {
  return buffer.subarray(start, start + length).toString("ascii");
}

export function detectarMime(buffer: Buffer): MimePermitido | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (ascii(buffer, 0, 4) === "RIFF" && ascii(buffer, 8, 4) === "WEBP") {
    return "image/webp";
  }
  if (ascii(buffer, 0, 4) === "%PDF") {
    return "application/pdf";
  }
  if (ascii(buffer, 0, 4) === "ftyp" || ascii(buffer, 4, 4) === "ftyp") {
    const brand = ascii(buffer, 8, 4);
    if (brand.startsWith("qt")) return "video/quicktime";
    return "video/mp4";
  }
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return "video/webm";
  }
  if (
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0
  ) {
    return "application/msword";
  }
  if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
    const amostra = buffer.subarray(0, Math.min(buffer.length, 8000)).toString("latin1");
    if (amostra.includes("word/")) {
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
  }

  if (ascii(buffer, 4, 4) === "heic" || ascii(buffer, 8, 4) === "heic") {
    return null;
  }

  return null;
}

export function mimePermitidoParaCategoria(
  categoria: categoria_arquivo,
  mime: MimePermitido,
): boolean {
  if (categoria === "video") return MIME_VIDEO.includes(mime);
  if (
    categoria === "foto_evolucao" ||
    categoria === "foto_antes" ||
    categoria === "foto_depois"
  ) {
    return MIME_FOTO.includes(mime);
  }
  return MIME_DOCUMENTO.includes(mime);
}

export function resolverMimeArquivo(
  buffer: Buffer,
  categoria: categoria_arquivo,
): MimePermitido {
  const mime = detectarMime(buffer);
  if (!mime) {
    throw new AppError(
      "Arquivo não reconhecido. Envie JPEG, PNG, WEBP, PDF ou vídeo MP4.",
      "MIME_INVALIDO",
    );
  }
  if (!mimePermitidoParaCategoria(categoria, mime)) {
    throw new AppError(
      categoria === "video"
        ? "Vídeo precisa ser MP4, WEBM ou MOV."
        : "Este tipo de arquivo não é permitido nesta categoria.",
      "MIME_CATEGORIA",
    );
  }
  return mime;
}
