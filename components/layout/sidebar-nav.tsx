"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/badge";
import {
  labelsGrupoNav,
  navegacaoPrincipal,
  type NavGrupo,
  type NavItem,
} from "@/config/navigation";
import { possuiPermissao, type Permissao } from "@/lib/auth/permissoes";
import type { PerfilUsuario } from "@/types/dominio";
import { appConfig } from "@/config/app";

type Props = {
  perfil: PerfilUsuario;
  onNavigate?: () => void;
};

const ordemGrupos: NavGrupo[] = ["clinico", "biblioteca", "admin"];

export function SidebarNav({ perfil, onNavigate }: Props) {
  const pathname = usePathname();

  const items = navegacaoPrincipal.filter((item) => {
    if (!item.permissao) return true;
    return possuiPermissao(perfil, item.permissao as Permissao);
  });

  const porGrupo = ordemGrupos
    .map((grupo) => ({
      grupo,
      items: items.filter((i) => i.grupo === grupo),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-fg">
          Fx
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            {appConfig.name}
          </p>
          <p className="truncate text-2xs text-ink-subtle">Clínica</p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3" aria-label="Principal">
        {porGrupo.map(({ grupo, items: grupoItems }) => (
          <div key={grupo} className="space-y-0.5">
            <p className="px-2.5 pb-1 text-2xs font-medium uppercase tracking-wide text-ink-subtle">
              {labelsGrupoNav[grupo]}
            </p>
            {grupoItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                ativo={
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)
                }
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}

function NavLink({
  item,
  ativo,
  onNavigate,
}: {
  item: NavItem;
  ativo: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={item.dica}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition duration-150 ease-out",
        ativo
          ? "bg-primary/15 text-ink"
          : "text-ink-muted hover:bg-surface-raised hover:text-ink",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          ativo ? "text-primary" : "text-ink-subtle group-hover:text-ink-muted",
        )}
      />
      <span className="flex-1 truncate">{item.title}</span>
      {!item.disponivel ? (
        <Badge className="opacity-70">em breve</Badge>
      ) : null}
    </Link>
  );
}
