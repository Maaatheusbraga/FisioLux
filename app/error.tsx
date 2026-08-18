"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold text-ink">Algo deu errado</h1>
      <p className="text-sm text-ink-muted">Não foi possível concluir esta ação.</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => reset()}>
          Tentar de novo
        </Button>
        <Link href="/dashboard">
          <Button type="button" variant="secondary">
            Voltar ao início
          </Button>
        </Link>
      </div>
    </main>
  );
}
