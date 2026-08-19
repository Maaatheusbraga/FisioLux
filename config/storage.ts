/**
 * Seleção do provider de storage via env.
 * Implementações concretas nas Fases 10+.
 */
export const storageConfig = {
  provider: (process.env.STORAGE_PROVIDER ?? "supabase") as "supabase" | "r2",
  bucket: (process.env.STORAGE_BUCKET ?? "fisiolux").trim().toLowerCase(),
  trashPrefix: "lixeira",
} as const;
