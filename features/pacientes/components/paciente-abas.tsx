import Link from "next/link";
import { cn } from "@/utils/cn";

export type PacienteAba = "timeline" | "cadastro" | "prontuario";

type Props = {
  pacienteId: string;
  aba: PacienteAba;
  query?: Record<string, string | undefined>;
  mostrarProntuario?: boolean;
};

export function PacienteAbas({
  pacienteId,
  aba,
  query = {},
  mostrarProntuario = false,
}: Props) {
  const base = `/pacientes/${pacienteId}`;
  const qs = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });

  const href = (proxima: PacienteAba) => {
    const p = new URLSearchParams(qs);
    p.set("aba", proxima);
    return `${base}?${p.toString()}`;
  };

  const abas: { id: PacienteAba; label: string }[] = [
    { id: "timeline", label: "Timeline" },
    { id: "cadastro", label: "Cadastro" },
    ...(mostrarProntuario
      ? [{ id: "prontuario" as const, label: "Prontuário" }]
      : []),
  ];

  return (
    <div className="mb-6 flex gap-1 border-b border-border">
      {abas.map((item) => (
        <Link
          key={item.id}
          href={href(item.id)}
          className={cn(
            "border-b-2 px-3 py-2 text-sm font-medium transition",
            aba === item.id
              ? "border-primary text-ink"
              : "border-transparent text-ink-muted hover:text-ink",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
