import { ArquivoUploadForm } from "@/features/arquivos/components/arquivo-upload-form";
import { ArquivosLista } from "@/features/arquivos/components/arquivos-lista";
import type { ArquivoListaItem } from "@/features/arquivos/components/arquivos-lista";

type CategoriaOpt = { value: string; label: string };

type Props = {
  paciente: { id: string; nome: string };
  categorias: CategoriaOpt[];
  arquivos: ArquivoListaItem[];
};

/** Documentos do paciente (laudo, receita, etc.) — sem fotos/vídeos. */
export function PacienteArquivosPainel({
  paciente,
  categorias,
  arquivos,
}: Props) {
  const redirectTo = `/pacientes/${paciente.id}?aba=arquivos`;

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-surface-raised p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">Novo documento</h2>
        <ArquivoUploadForm
          categorias={categorias}
          pacienteFixo={paciente}
          redirectTo={redirectTo}
          modo="documentos"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Documentos anexados</h2>
        <ArquivosLista
          arquivos={arquivos}
          redirectTo={redirectTo}
          emptyLabel="Nenhum documento"
        />
      </section>
    </div>
  );
}
