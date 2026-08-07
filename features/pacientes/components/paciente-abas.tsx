import Link from "next/link";
import { cn } from "@/utils/cn";

type Props = {
  pacienteId: string;
  aba: "timeline" | "cadastro";
  query?: Record<string, string | undefined>;
};

export function PacienteAbas({ pacienteId, aba, query = {} }: Props) {
  const base = `/pacientes/${pacienteId}`;
  const qs = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });

  const href = (proxima: "timeline" | "cadastro") => {
    const p = new URLSearchParams(qs);
    p.set("aba", proxima);
    return `${base}?${p.toString()}`;
  };

  return (
    <div className="mb-6 flex gap-1 border-b border-border">
      <Link
        href={href("timeline")}
        className={cn(
          "border-b-2 px-3 py-2 text-sm font-medium transition",
          aba === "timeline"
            ? "border-primary text-ink"
            : "border-transparent text-ink-muted hover:text-ink",
        )}
      >
        Timeline
      </Link>
      <Link
        href={href("cadastro")}
        className={cn(
          "border-b-2 px-3 py-2 text-sm font-medium transition",
          aba === "cadastro"
            ? "border-primary text-ink"
            : "border-transparent text-ink-muted hover:text-ink",
        )}
      >
        Cadastro
      </Link>
    </div>
  );
}
