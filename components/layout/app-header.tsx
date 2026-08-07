"use client";

import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { logoutAction } from "@/features/auth/actions";
import type { PerfilUsuario } from "@/types/dominio";
import { cn } from "@/utils/cn";

type Props = {
  nome: string;
  email: string;
  perfil: PerfilUsuario;
};

export function AppHeader({ nome, email, perfil }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur-md md:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Abrir menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Breadcrumb className="min-w-0 flex-1" />

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <div className="hidden text-right sm:block">
            <p className="max-w-[10rem] truncate text-sm font-medium leading-tight">
              {nome}
            </p>
            <p className="max-w-[10rem] truncate text-2xs capitalize text-ink-subtle">
              {perfil}
            </p>
          </div>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label="Sair"
              title={`Sair (${email})`}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          aria-label="Fechar menu"
          className={cn(
            "absolute inset-0 bg-overlay transition duration-200 ease-out",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r border-border bg-sidebar shadow-xl transition duration-200 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="absolute right-2 top-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Fechar"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SidebarNav perfil={perfil} onNavigate={() => setMobileOpen(false)} />
        </aside>
      </div>
    </>
  );
}
