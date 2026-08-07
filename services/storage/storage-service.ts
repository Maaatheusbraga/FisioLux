import type { StorageProvider } from "../../types/dominio";

/**
 * Contrato do StorageService.
 * Implementação Supabase: Fase 10.
 * Troca para R2: nova classe, mesmo contrato.
 */
export type UploadInput = {
  clinicaId: string;
  pacienteId: string;
  categoria: string;
  fileName: string;
  mimeType: string;
  body: Buffer | Blob | ArrayBuffer;
  sessaoId?: string;
};

export type StorageObject = {
  provider: StorageProvider;
  bucket: string;
  storageKey: string;
  mimeType: string;
  tamanho: number;
};

export interface StorageService {
  upload(input: UploadInput): Promise<StorageObject>;
  getSignedUrl(storageKey: string, expiresInSeconds: number): Promise<string>;
  moveToTrash(storageKey: string): Promise<StorageObject>;
  deletePermanent(storageKey: string): Promise<void>;
  download(storageKey: string): Promise<Buffer>;
}
