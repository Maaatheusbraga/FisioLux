import { SidebarNav } from "@/components/layout/sidebar-nav";
import { AppHeader } from "@/components/layout/app-header";
import type { PerfilUsuario } from "@/types/dominio";

type Props = {
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  children: React.ReactNode;
};

export function AppShell({ nome, email, perfil, children }: Props) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-sidebar md:block">
          <SidebarNav perfil={perfil} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader nome={nome} email={email} perfil={perfil} />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
