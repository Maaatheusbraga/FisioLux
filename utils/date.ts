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

/** Date → YYYY-MM-DDTHH:mm para input[type=datetime-local] (fuso da clínica). */
export function toInputDateTimeLocalBr(
  valor: Date | string | null | undefined,
): string {
  if (!valor) return "";
  const date = typeof valor === "string" ? new Date(valor) : valor;
  const formatado = new Intl.DateTimeFormat("sv-SE", {
    timeZone: FUSO_CLINICA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return formatado.replace(" ", "T");
}

/** YYYY-MM-DDTHH:mm (fuso da clínica) → Date UTC. */
export function parseDateTimeLocalBr(valor: string): Date {
  const normalizado = valor.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalizado)) {
    throw new Error("Data/hora inválida.");
  }
  return new Date(`${normalizado}:00-03:00`);
}

/** Início e fim do dia civil no fuso da clínica. */
export function limitesDoDiaBr(referencia: Date = new Date()) {
  const dia = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_CLINICA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(referencia);
  return {
    inicio: new Date(`${dia}T00:00:00-03:00`),
    fim: new Date(`${dia}T23:59:59.999-03:00`),
  };
}

/** Soma horas a um valor datetime-local (fuso da clínica). */
export function adicionarHorasDateTimeLocalBr(
  valor: string,
  horas: number,
): string {
  const base = parseDateTimeLocalBr(valor);
  base.setTime(base.getTime() + horas * 60 * 60 * 1000);
  return toInputDateTimeLocalBr(base);
}

/** Hora curta (fuso da clínica). */
export function formatarHoraBr(valor: Date | string | null | undefined): string {
  if (!valor) return "—";
  const date = typeof valor === "string" ? new Date(valor) : valor;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_CLINICA,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
