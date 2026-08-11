import { randomUUID } from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { storageConfig } from "@/config/storage";
import { AppError } from "@/lib/errors/app-error";
import type {
  StorageObject,
  StorageService,
  UploadInput,
} from "@/services/storage/storage-service";

function sanitizeFileName(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return (base || "arquivo").slice(0, 120);
}

async function toBuffer(body: UploadInput["body"]): Promise<Buffer> {
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof ArrayBuffer) return Buffer.from(body);
  if (typeof Blob !== "undefined" && body instanceof Blob) {
    return Buffer.from(await body.arrayBuffer());
  }
  throw new AppError(
    "Tipo de arquivo inválido para upload.",
    "STORAGE_INVALID_BODY",
  );
}

function buildKey(
  clinicaId: string,
  pacienteId: string,
  categoria: string,
  fileName: string,
  trash = false,
): string {
  const safe = sanitizeFileName(fileName);
  const path = `${clinicaId}/${pacienteId}/${categoria}/${randomUUID()}-${safe}`;
  return trash ? `${storageConfig.trashPrefix}/${path}` : path;
}

export class SupabaseStorageService implements StorageService {
  private readonly bucket = storageConfig.bucket;

  private client() {
    return createSupabaseAdminClient();
  }

  async upload(input: UploadInput): Promise<StorageObject> {
    const buffer = await toBuffer(input.body);
    const storageKey = buildKey(
      input.clinicaId,
      input.pacienteId,
      input.categoria,
      input.fileName,
    );

    const { error } = await this.client()
      .storage.from(this.bucket)
      .upload(storageKey, buffer, {
        contentType: input.mimeType,
        upsert: false,
      });

    if (error) {
      throw new AppError(
        `Falha no upload: ${error.message}`,
        "STORAGE_UPLOAD_FAILED",
      );
    }

    return {
      provider: "supabase",
      bucket: this.bucket,
      storageKey,
      mimeType: input.mimeType,
      tamanho: buffer.byteLength,
    };
  }

  async getSignedUrl(
    storageKey: string,
    expiresInSeconds: number,
  ): Promise<string> {
    const { data, error } = await this.client()
      .storage.from(this.bucket)
      .createSignedUrl(storageKey, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw new AppError(
        `Não foi possível gerar URL: ${error?.message ?? "erro desconhecido"}`,
        "STORAGE_SIGNED_URL_FAILED",
      );
    }

    return data.signedUrl;
  }

  async moveToTrash(storageKey: string): Promise<StorageObject> {
    if (storageKey.startsWith(`${storageConfig.trashPrefix}/`)) {
      return {
        provider: "supabase",
        bucket: this.bucket,
        storageKey,
        mimeType: "application/octet-stream",
        tamanho: 0,
      };
    }

    const trashKey = `${storageConfig.trashPrefix}/${storageKey}`;
    const { error } = await this.client()
      .storage.from(this.bucket)
      .move(storageKey, trashKey);

    if (error) {
      throw new AppError(
        `Falha ao mover para lixeira: ${error.message}`,
        "STORAGE_TRASH_FAILED",
      );
    }

    return {
      provider: "supabase",
      bucket: this.bucket,
      storageKey: trashKey,
      mimeType: "application/octet-stream",
      tamanho: 0,
    };
  }

  async deletePermanent(storageKey: string): Promise<void> {
    const { error } = await this.client()
      .storage.from(this.bucket)
      .remove([storageKey]);

    if (error) {
      throw new AppError(
        `Falha ao excluir permanentemente: ${error.message}`,
        "STORAGE_DELETE_FAILED",
      );
    }
  }

  async download(storageKey: string): Promise<Buffer> {
    const { data, error } = await this.client()
      .storage.from(this.bucket)
      .download(storageKey);

    if (error || !data) {
      throw new AppError(
        `Falha ao baixar: ${error?.message ?? "arquivo ausente"}`,
        "STORAGE_DOWNLOAD_FAILED",
      );
    }

    const ab = await data.arrayBuffer();
    return Buffer.from(ab);
  }
}
