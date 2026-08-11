import { storageConfig } from "@/config/storage";
import type { StorageService } from "@/services/storage/storage-service";
import { SupabaseStorageService } from "@/lib/storage/supabase-storage";
import { AppError } from "@/lib/errors/app-error";

let singleton: StorageService | null = null;

/** Factory do StorageService conforme `STORAGE_PROVIDER`. */
export function getStorageService(): StorageService {
  if (singleton) return singleton;

  if (storageConfig.provider === "supabase") {
    singleton = new SupabaseStorageService();
    return singleton;
  }

  throw new AppError(
    `Provider de storage não implementado: ${storageConfig.provider}`,
    "STORAGE_PROVIDER_UNSUPPORTED",
  );
}
