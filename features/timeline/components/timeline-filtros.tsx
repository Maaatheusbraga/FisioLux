import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { labelTipoEvento } from "@/config/timeline";
import type { tipo_evento_timeline } from "@prisma/client";

type Profissional = { id: string; nome: string };

type Props = {
  pacienteId: string;
  tipos: tipo_evento_timeline[];
  profissionais: Profissional[];
  tipo?: string;
  profissional?: string;
  de?: string;
  ate?: string;
};

export function TimelineFiltros({
  pacienteId,
  tipos,
  profissionais,
  tipo = "todos",
  profissional = "todos",
  de = "",
  ate = "",
}: Props) {
  return (
    <form
      method="get"
      className="grid gap-3 rounded-xl border border-border bg-surface/50 p-4 md:grid-cols-2 lg:grid-cols-5 lg:items-end"
    >
      <input type="hidden" name="aba" value="timeline" />

      <div className="space-y-1.5">
        <label htmlFor="tipo" className="text-sm text-ink-muted">
          Tipo
        </label>
        <Select id="tipo" name="tipo" defaultValue={tipo}>
          <option value="todos">Todos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>
              {labelTipoEvento(t)}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="profissional" className="text-sm text-ink-muted">
          Profissional
        </label>
        <Select
          id="profissional"
          name="profissional"
          defaultValue={profissional}
        >
          <option value="todos">Todos</option>
          {profissionais.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="de" className="text-sm text-ink-muted">
          De
        </label>
        <Input id="de" name="de" type="date" defaultValue={de} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="ate" className="text-sm text-ink-muted">
          Até
        </label>
        <Input id="ate" name="ate" type="date" defaultValue={ate} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" variant="secondary" className="w-full">
          Filtrar
        </Button>
        <Link
          href={`/pacientes/${pacienteId}?aba=timeline`}
          className="inline-flex h-10 shrink-0 items-center px-2 text-sm text-ink-muted hover:text-ink"
        >
          Limpar
        </Link>
      </div>
    </form>
  );
}
