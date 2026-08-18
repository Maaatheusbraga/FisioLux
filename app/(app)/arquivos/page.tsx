import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ArquivoUploadForm } from "@/features/arquivos/components/arquivo-upload-form";
import { ArquivosLista } from "@/features/arquivos/components/arquivos-lista";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { ArquivoService } from "@/services/arquivos/arquivo-service";
import { PacienteService } from "@/services/pacientes/paciente-service";
import { listarArquivosQuerySchema } from "@/lib/validations/arquivo";
import { CATEGORIAS_DOCUMENTOS, labelCategoriaArquivo } from "@/config/arquivos";
import type { categoria_arquivo } from "@prisma/client";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ArquivosPage({ searchParams }: Props) {
  const sessao = await exigirSessao();
  if (
    !possuiPermissao(sessao.perfil, "arquivos.cadastrais") &&
    !possuiPermissao(sessao.perfil, "arquivos.clinicos")
  ) {
    redirect("/dashboard");
  }

  const raw = await searchParams;
  const parsed = listarArquivosQuerySchema.safeParse({
    paciente: typeof raw.paciente === "string" ? raw.paciente : undefined,
    categoria: typeof raw.categoria === "string" ? raw.categoria : undefined,
    page: typeof raw.page === "string" ? raw.page : undefined,
  });
  const query = parsed.success
    ? parsed.data
    : { paciente: undefined, categoria: "todos" as const, page: 1 };

  const categoriaFiltro =
    query.categoria !== "todos" &&
    (CATEGORIAS_DOCUMENTOS as readonly string[]).includes(query.categoria)
      ? (query.categoria as categoria_arquivo)
      : ("todos" as const);

  const service = new ArquivoService();
  const categorias = service.categoriasDisponiveisParaUpload(
    sessao,
    "documentos",
  );

  let pacienteFixo: { id: string; nome: string } | null = null;
  if (query.paciente) {
    try {
      const p = await new PacienteService().obter(sessao, query.paciente);
      pacienteFixo = { id: p.id, nome: p.nome };
    } catch {
      pacienteFixo = null;
    }
  }

  const resultado = await service.listar(sessao, {
    pacienteId: query.paciente,
    escopo: "documentos",
    categoria: categoriaFiltro,
    page: query.page,
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Documentos">
        <form method="get" className="flex flex-wrap items-end gap-3">
          {query.paciente ? (
            <input type="hidden" name="paciente" value={query.paciente} />
          ) : null}
          <div className="w-52 space-y-1.5">
            <label htmlFor="categoria" className="text-sm text-ink-muted">
              Categoria
            </label>
            <Select
              id="categoria"
              name="categoria"
              defaultValue={
                categoriaFiltro === "todos" ? "todos" : categoriaFiltro
              }
            >
              <option value="todos">Todas</option>
              {categorias.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" variant="secondary">
            Filtrar
          </Button>
          {query.paciente ? (
            <Link
              href="/arquivos"
              className="text-sm text-ink-muted hover:text-ink"
            >
              Limpar paciente
            </Link>
          ) : null}
        </form>
      </PageHeader>

      {pacienteFixo ? (
        <p className="text-sm text-ink-muted">
          <Link
            href={`/pacientes/${pacienteFixo.id}?aba=arquivos`}
            className="text-ink hover:text-primary"
          >
            {pacienteFixo.nome}
          </Link>
          {" · "}
          <Link
            href={`/pacientes/${pacienteFixo.id}?aba=fotos`}
            className="text-ink hover:text-primary"
          >
            Fotos
          </Link>
        </p>
      ) : null}

      <section className="max-w-3xl rounded-xl border border-border bg-surface-raised p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Enviar documento</h2>
        <ArquivoUploadForm
          categorias={categorias}
          pacienteFixo={pacienteFixo}
          redirectTo={
            query.paciente
              ? `/arquivos?paciente=${query.paciente}`
              : "/arquivos"
          }
          modo="documentos"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">
          Documentos recentes
          <span className="ml-2 font-normal text-ink-muted">
            ({resultado.total})
          </span>
        </h2>
        <ArquivosLista
          arquivos={resultado.items}
          mostrarPaciente
          redirectTo={
            query.paciente
              ? `/arquivos?paciente=${query.paciente}`
              : "/arquivos"
          }
        />
      </section>
    </div>
  );
}
