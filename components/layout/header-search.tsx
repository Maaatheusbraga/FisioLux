"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";

/** Busca de pacientes no header — visível também no celular. */
export function HeaderSearch({ className }: { className?: string }) {
  return (
    <form
      action="/pacientes"
      method="get"
      className={cn("relative min-w-0 flex-1", className)}
      role="search"
    >
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
        aria-hidden
      />
      <Input
        name="q"
        type="search"
        placeholder="Buscar paciente…"
        aria-label="Buscar paciente por nome, CPF ou telefone"
        className="h-11 pl-9 text-base md:h-10 md:text-sm"
        autoComplete="off"
        enterKeyHint="search"
      />
    </form>
  );
}
