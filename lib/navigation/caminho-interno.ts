/** Só caminhos relativos da app. Bloqueia `//host` e esquemas. */
export function caminhoInterno(valor: string, fallback = "/dashboard"): string {
  const path = valor.trim();
  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//") || path.startsWith("/\\")) return fallback;
  if (path.includes("://") || path.includes("\\")) return fallback;
  return path;
}
