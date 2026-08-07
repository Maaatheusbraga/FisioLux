"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { navegacaoPrincipal } from "@/config/navigation";
import { cn } from "@/utils/cn";

const titulosExtras: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/login": "Entrar",
};

export function Breadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();
  const item = navegacaoPrincipal.find(
    (n) => pathname === n.href || pathname.startsWith(`${n.href}/`),
  );
  const titulo =
    item?.title ?? titulosExtras[pathname] ?? pathname.split("/").filter(Boolean).at(-1) ?? "App";

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-sm text-ink-muted", className)}
    >
      <Link href="/dashboard" className="transition hover:text-ink">
        Início
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-ink-subtle" aria-hidden />
      <span className="font-medium text-ink">{titulo}</span>
    </nav>
  );
}
