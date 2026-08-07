import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Props = {
  q?: string;
  status?: string;
};

export function PacientesFiltros({ q = "", status = "todos" }: Props) {
  return (
    <form className="flex flex-col gap-3 sm:flex-row sm:items-end" method="get">
      <div className="min-w-0 flex-1 space-y-1.5">
        <label htmlFor="q" className="text-sm text-ink-muted">
          Buscar
        </label>
        <Input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Nome, CPF, telefone, diagnóstico…"
        />
      </div>
      <div className="w-full space-y-1.5 sm:w-48">
        <label htmlFor="status" className="text-sm text-ink-muted">
          Status
        </label>
        <Select id="status" name="status" defaultValue={status}>
          <option value="todos">Todos</option>
          <option value="em_tratamento">Em tratamento</option>
          <option value="alta">Alta</option>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
        {(q || status !== "todos") && (
          <Link
            href="/pacientes"
            className="inline-flex h-10 items-center rounded-lg px-3 text-sm text-ink-muted hover:text-ink"
          >
            Limpar
          </Link>
        )}
      </div>
    </form>
  );
}
