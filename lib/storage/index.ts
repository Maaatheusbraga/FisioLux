import { storageConfig } from "@/config/storage";
import type { StorageService } from "@/services/storage/storage-service";
import { SupabaseStorageService } from "@/lib/storage/supabase-storage";
import { R2StorageService } from "@/lib/storage/r2-storage";

let singleton: StorageService | null = null;

/**
 * Factory do StorageService conforme `STORAGE_PROVIDER`.
 *
 * "supabase" → SupabaseStorageService (padrão atual)
 * "r2"       → R2StorageService (Cloudflare R2 — requer @aws-sdk/client-s3)
 *
 * Para migrar, altere STORAGE_PROVIDER=r2 no .env e reinicie o container.
 * Os storageKeys no banco são idênticos em ambos os providers.
 */
export function getStorageService(): StorageService {
  if (singleton) return singleton;

  if (storageConfig.provider === "supabase") {
    singleton = new SupabaseStorageService();
    return singleton;
  }

  if (storageConfig.provider === "r2") {
    singleton = new R2StorageService();
    return singleton;
  }

  // Garante exhaustiveness — TypeScript avisa se um provider novo for adicionado
  // ao tipo mas não implementado aqui.
  const _never: never = storageConfig.provider;
  throw new Error(`Provider de storage não implementado: ${_never}`);
}
