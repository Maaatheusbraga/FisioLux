"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/** Busca de pacientes no header — evita item dedicado no menu. */
export function HeaderSearch() {
  return (
    <form
      action="/pacientes"
      method="get"
      className="relative hidden min-w-0 max-w-xs flex-1 md:block"
      role="search"
    >
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle"
        aria-hidden
      />
      <Input
        name="q"
        type="search"
        placeholder="Buscar paciente…"
        aria-label="Buscar paciente por nome, CPF ou telefone"
        className="h-9 pl-8 text-sm"
        autoComplete="off"
      />
    </form>
  );
}
