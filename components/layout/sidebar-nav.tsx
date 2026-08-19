"use client";

import Image from "next/image";
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

const ordemGrupos: NavGrupo[] = ["clinico", "admin"];

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
    <div className="relative flex h-full flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_55%_at_12%_-8%,oklch(0.72_0.09_160/0.22),transparent_58%)] dark:bg-[radial-gradient(120%_55%_at_12%_-8%,oklch(0.48_0.08_160/0.28),transparent_58%)]"
      />
      <div className="relative z-10 flex h-14 items-center gap-2 border-b border-border px-4">
        <Image
          src="/logo-mark.png"
          alt=""
          width={281}
          height={281}
          className="h-8 w-8 shrink-0 object-contain"
        />
        <p className="min-w-0 truncate text-sm font-semibold tracking-tight">
          {appConfig.name}
        </p>
      </div>

      <nav className="relative z-10 flex-1 space-y-4 overflow-y-auto p-3" aria-label="Principal">
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
        "group flex min-h-11 items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm transition duration-150 ease-out md:min-h-0 md:py-2",
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
