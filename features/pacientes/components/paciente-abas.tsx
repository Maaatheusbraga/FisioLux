import Link from "next/link";
import { cn } from "@/utils/cn";

export type PacienteAba =
  | "timeline"
  | "cadastro"
  | "prontuario"
  | "arquivos"
  | "fotos";

type Props = {
  pacienteId: string;
  aba: PacienteAba;
  query?: Record<string, string | undefined>;
  mostrarProntuario?: boolean;
  mostrarArquivos?: boolean;
  mostrarFotos?: boolean;
};

export function PacienteAbas({
  pacienteId,
  aba,
  query = {},
  mostrarProntuario = false,
  mostrarArquivos = false,
  mostrarFotos = false,
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
    { id: "cadastro", label: "Dados" },
    ...(mostrarProntuario
      ? [{ id: "prontuario" as const, label: "Prontuário" }]
      : []),
    ...(mostrarArquivos
      ? [{ id: "arquivos" as const, label: "Documentos" }]
      : []),
    ...(mostrarFotos ? [{ id: "fotos" as const, label: "Fotos" }] : []),
  ];

  return (
    <div className="-mx-4 mb-6 border-b border-border md:mx-0">
      <div
        className="flex gap-1 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] md:px-0 [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Seções do paciente"
      >
        {abas.map((item) => (
          <Link
            key={item.id}
            href={href(item.id)}
            role="tab"
            aria-selected={aba === item.id}
            className={cn(
              "shrink-0 snap-start border-b-2 px-3 py-3 text-sm font-medium transition md:py-2",
              aba === item.id
                ? "border-primary text-ink"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
