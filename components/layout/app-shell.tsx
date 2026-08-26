import { SidebarNav } from "@/components/layout/sidebar-nav";
import { AppHeader } from "@/components/layout/app-header";
import { AppProviders } from "@/components/providers/app-providers";
import type { PerfilUsuario } from "@/types/dominio";

type Props = {
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  children: React.ReactNode;
};

export function AppShell({ nome, email, perfil, children }: Props) {
  return (
    <AppProviders>
      <div className="min-h-screen bg-bg">
        <a
          href="#conteudo-principal"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface-raised focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-ink focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Ir para o conteúdo
        </a>
        <div className="mx-auto flex min-h-screen">
          <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-sidebar md:block">
            <SidebarNav perfil={perfil} />
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <AppHeader nome={nome} email={email} perfil={perfil} />
            <main
              id="conteudo-principal"
              className="flex-1 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8 md:py-8"
              tabIndex={-1}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </AppProviders>
  );
}
