/** Converte YYYY-MM-DD (input date) em Date UTC meio-dia. */
export function parseDataIso(valor: string): Date {
  const [y, m, d] = valor.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

/** Date → YYYY-MM-DD para input[type=date]. */
export function toInputDate(valor: Date | string): string {
  const date = typeof valor === "string" ? new Date(valor) : valor;
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Formata data BR. */
export function formatarDataBr(valor: Date | string | null | undefined): string {
  if (!valor) return "—";
  const date = typeof valor === "string" ? new Date(valor) : valor;
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

/** Formata data+hora BR (America/Sao_Paulo aproximado via locale). */
export function formatarDataHoraBr(
  valor: Date | string | null | undefined,
): string {
  if (!valor) return "—";
  const date = typeof valor === "string" ? new Date(valor) : valor;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function calcularIdade(dataNascimento: Date): number {
  const hoje = new Date();
  let idade = hoje.getUTCFullYear() - dataNascimento.getUTCFullYear();
  const m = hoje.getUTCMonth() - dataNascimento.getUTCMonth();
  if (m < 0 || (m === 0 && hoje.getUTCDate() < dataNascimento.getUTCDate())) {
    idade -= 1;
  }
  return idade;
}
