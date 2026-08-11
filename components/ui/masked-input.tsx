"use client";

import { useState, type ChangeEvent } from "react";
import { Input, type InputProps } from "@/components/ui/input";
import {
  MAX_LENGTH_MASCARA,
  PLACEHOLDER_MASCARA,
  aplicarMascara,
  type TipoMascara,
} from "@/utils/cpf";

type Props = Omit<InputProps, "type" | "value" | "defaultValue" | "onChange"> & {
  mask: TipoMascara;
  /** Valor inicial (pode vir sem máscara do banco). */
  defaultValue?: string | null;
};

/**
 * Input com máscara BR (CPF, RG, telefone, CNPJ).
 * O valor enviado no FormData já vai formatado; validações devem normalizar dígitos.
 */
export function MaskedInput({
  mask,
  defaultValue = "",
  placeholder,
  inputMode,
  maxLength,
  ...props
}: Props) {
  const [value, setValue] = useState(() =>
    aplicarMascara(mask, defaultValue ?? ""),
  );

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(aplicarMascara(mask, e.target.value));
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode={inputMode ?? "numeric"}
      autoComplete={props.autoComplete ?? "off"}
      placeholder={placeholder ?? PLACEHOLDER_MASCARA[mask]}
      maxLength={maxLength ?? MAX_LENGTH_MASCARA[mask]}
      value={value}
      onChange={onChange}
    />
  );
}
