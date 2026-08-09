import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PacienteDetalhe } from "@/features/pacientes/components/paciente-detalhe";
import { PacienteAbas } from "@/features/pacientes/components/paciente-abas";
import { ProntuarioPainel } from "@/features/prontuario/components/prontuario-painel";
import { TimelineFiltros } from "@/features/timeline/components/timeline-filtros";
import { TimelineLista } from "@/features/timeline/components/timeline-lista";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { PacienteService } from "@/services/pacientes/paciente-service";
import { TimelineService } from "@/services/timeline/timeline-service";
import { ProntuarioService } from "@/services/prontuario/prontuario-service";
import { listarTimelineQuerySchema } from "@/lib/validations/timeline";
import { AppError } from "@/lib/errors/app-error";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PacientePage({ params, searchParams }: Props) {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "pacientes.gerenciar")) {
    redirect("/dashboard");
  }

  const podeProntuario = possuiPermissao(sessao.perfil, "prontuario.acessar");
  const { id } = await params;
  const raw = await searchParams;
  const query = listarTimelineQuerySchema.safeParse({
    tipo: typeof raw.tipo === "string" ? raw.tipo : undefined,
    profissional:
      typeof raw.profissional === "string" ? raw.profissional : undefined,
    de: typeof raw.de === "string" ? raw.de : undefined,
    ate: typeof raw.ate === "string" ? raw.ate : undefined,
    page: typeof raw.page === "string" ? raw.page : undefined,
    aba: typeof raw.aba === "string" ? raw.aba : undefined,
  });

  const filtros = query.success
    ? query.data
    : {
        tipo: "todos",
        profissional: "todos",
        de: undefined as string | undefined,
        ate: undefined as string | undefined,
        page: 1,
        aba: "timeline" as const,
      };

  let aba = filtros.aba;
  if (aba === "prontuario" && !podeProntuario) {
    aba = "timeline";
  }

  const pacienteService = new PacienteService();
  const timelineService = new TimelineService();
  const prontuarioService = new ProntuarioService();

  try {
    const paciente = await pacienteService.obter(sessao, id);
    const profissionais = await timelineService.listarProfissionaisFiltro(sessao);
    const tipos = timelineService.tiposDisponiveisParaFiltro(sessao);

    const timeline =
      aba === "timeline"
        ? await timelineService.listarPorPaciente(sessao, id, {
            tipo: filtros.tipo,
            profissionalId: filtros.profissional,
            de: filtros.de,
            ate: filtros.ate,
            page: filtros.page,
          })
        : null;

    const painel =
      aba === "prontuario"
        ? await prontuarioService.obterPainel(sessao, id)
        : null;

    const totalPages = timeline
      ? Math.max(1, Math.ceil(timeline.total / timeline.pageSize))
      : 1;

    return (
      <div>
        <PageHeader
          title={paciente.nome}
          description="Histórico clínico em Timeline — o centro do FisioLux."
          actions={
            <div className="flex flex-wrap gap-2">
              <Badge
                className={
                  paciente.status === "alta"
                    ? "border-accent/30 text-accent"
                    : "border-primary/30 text-primary"
                }
              >
                {paciente.status === "alta" ? "Alta" : "Em tratamento"}
              </Badge>
              <Link href={`/pacientes/${paciente.id}/editar`}>
                <Button type="button" variant="secondary" size="sm">
                  Editar cadastro
                </Button>
              </Link>
              {possuiPermissao(sessao.perfil, "sessoes.gerenciar") ? (
                <Link href={`/sessoes/nova?paciente=${paciente.id}`}>
                  <Button type="button" size="sm">
                    Nova sessão
                  </Button>
                </Link>
              ) : null}
            </div>
          }
        />

        <PacienteAbas
          pacienteId={paciente.id}
          aba={aba}
          mostrarProntuario={podeProntuario}
          query={{
            tipo: filtros.tipo,
            profissional: filtros.profissional,
            de: filtros.de,
            ate: filtros.ate,
          }}
        />

        {aba === "timeline" && timeline ? (
          <div className="space-y-6">
            <TimelineFiltros
              pacienteId={paciente.id}
              tipos={tipos}
              profissionais={profissionais}
              tipo={filtros.tipo}
              profissional={filtros.profissional}
              de={filtros.de}
              ate={filtros.ate}
            />

            <TimelineLista eventos={timeline.items} />

            <div className="flex items-center justify-between text-sm text-ink-muted">
              <p>
                {timeline.total} evento{timeline.total === 1 ? "" : "s"}
              </p>
              {totalPages > 1 ? (
                <div className="flex gap-2">
                  {timeline.page > 1 ? (
                    <Link
                      href={`/pacientes/${id}?aba=timeline&tipo=${filtros.tipo}&profissional=${filtros.profissional}&de=${filtros.de ?? ""}&ate=${filtros.ate ?? ""}&page=${timeline.page - 1}`}
                      className="hover:text-ink"
                    >
                      Anterior
                    </Link>
                  ) : null}
                  <span>
                    Página {timeline.page} / {totalPages}
                  </span>
                  {timeline.page < totalPages ? (
                    <Link
                      href={`/pacientes/${id}?aba=timeline&tipo=${filtros.tipo}&profissional=${filtros.profissional}&de=${filtros.de ?? ""}&ate=${filtros.ate ?? ""}&page=${timeline.page + 1}`}
                      className="hover:text-ink"
                    >
                      Próxima
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {aba === "cadastro" ? <PacienteDetalhe paciente={paciente} /> : null}

        {aba === "prontuario" && painel ? (
          <ProntuarioPainel
            paciente={{
              id: painel.paciente.id,
              nome: painel.paciente.nome,
              status: painel.paciente.status,
            }}
            anamneses={painel.anamneses}
            avaliacoes={painel.avaliacoes}
            planos={painel.planos}
            evolucoes={painel.evolucoes}
            altas={painel.altas}
          />
        ) : null}
      </div>
    );
  } catch (error) {
    if (error instanceof AppError && error.code === "PACIENTE_NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
