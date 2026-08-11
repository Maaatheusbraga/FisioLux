/** Remove tudo que não for dígito. */
export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Valida CPF (11 dígitos + dígitos verificadores). */
export function validarCpf(cpf: string): boolean {
  const d = apenasDigitos(cpf);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;

  const calc = (base: string, fator: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i += 1) {
      soma += Number(base[i]) * (fator - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = calc(d.slice(0, 9), 10);
  const d2 = calc(d.slice(0, 10), 11);
  return d1 === Number(d[9]) && d2 === Number(d[10]);
}

/** Formata CPF para exibição: 000.000.000-00 */
export function formatarCpf(cpf: string): string {
  const d = apenasDigitos(cpf).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Formata telefone BR: (00) 00000-0000 ou (00) 0000-0000 */
export function formatarTelefone(telefone: string | null | undefined): string {
  if (telefone == null || telefone === "") return "";
  const d = apenasDigitos(telefone).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Exibição em tabelas/detalhe — traço quando vazio. */
export function formatarTelefoneExibicao(
  telefone: string | null | undefined,
): string {
  return formatarTelefone(telefone) || "—";
}

/** Formata RG comum: 00.000.000-0 (aceita X no dígito final). */
export function formatarRg(rg: string | null | undefined): string {
  if (!rg) return "";
  const limpo = rg.replace(/[^\dXx]/g, "").toUpperCase().slice(0, 9);
  return limpo
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})([\dX])$/, "$1-$2");
}

/** Formata CNPJ: 00.000.000/0000-00 */
export function formatarCnpj(cnpj: string | null | undefined): string {
  if (cnpj == null || cnpj === "") return "";
  const d = apenasDigitos(cnpj).slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function formatarCnpjExibicao(
  cnpj: string | null | undefined,
): string {
  return formatarCnpj(cnpj) || "—";
}

export function formatarRgExibicao(rg: string | null | undefined): string {
  return formatarRg(rg) || "—";
}

export type TipoMascara = "cpf" | "rg" | "telefone" | "cnpj";

export function aplicarMascara(tipo: TipoMascara, valor: string): string {
  switch (tipo) {
    case "cpf":
      return formatarCpf(valor);
    case "rg":
      return formatarRg(valor);
    case "telefone":
      return formatarTelefone(valor);
    case "cnpj":
      return formatarCnpj(valor);
  }
}

export const PLACEHOLDER_MASCARA: Record<TipoMascara, string> = {
  cpf: "000.000.000-00",
  rg: "00.000.000-0",
  telefone: "(00) 00000-0000",
  cnpj: "00.000.000/0000-00",
};

export const MAX_LENGTH_MASCARA: Record<TipoMascara, number> = {
  cpf: 14,
  rg: 12,
  telefone: 15,
  cnpj: 18,
};
