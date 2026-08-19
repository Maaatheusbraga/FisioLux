/** Converte YYYY-MM-DD (input date) em Date UTC meio-dia. */
export function parseDataIso(valor: string): Date {
  const [y, m, d] = valor.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

const FUSO_CLINICA = "America/Sao_Paulo";

/** Date → YYYY-MM-DD para input[type=date] no fuso da clínica. */
export function toInputDate(valor: Date | string): string {
  const date = typeof valor === "string" ? new Date(valor) : valor;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_CLINICA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Formata data BR no fuso da clínica. */
export function formatarDataBr(valor: Date | string | null | undefined): string {
  if (!valor) return "—";
  const date = typeof valor === "string" ? new Date(valor) : valor;
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO_CLINICA }).format(
    date,
  );
}

/** Formata data+hora no fuso da clínica (Brasília). */
export function formatarDataHoraBr(
  valor: Date | string | null | undefined,
): string {
  if (!valor) return "—";
  const date = typeof valor === "string" ? new Date(valor) : valor;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: FUSO_CLINICA,
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
