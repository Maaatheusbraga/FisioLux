import type { Prisma, tipo_evento_timeline } from "@prisma/client";
import { AppError } from "@/lib/errors/app-error";
import {
  assertPermissao,
  ehPerfilClinico,
  possuiPermissao,
} from "@/lib/auth/permissoes";
import type { SessaoUsuario } from "@/lib/auth/sessao";
import {
  TimelineRepository,
  type CriarEventoTimelineInput,
} from "@/repositories/timeline/timeline-repository";
import { PacienteRepository } from "@/repositories/pacientes/paciente-repository";
import {
  LABELS_TIPO_EVENTO,
  TIPOS_EVENTO_CADASTRAIS,
} from "@/config/timeline";
import { parseDataIso } from "@/utils/date";
import { prisma } from "@/lib/prisma";
import type { TipoEventoTimeline } from "@/types/dominio";

type Tx = Prisma.TransactionClient;

export class TimelineService {
  constructor(
    private readonly timeline = new TimelineRepository(),
    private readonly pacientes = new PacienteRepository(),
  ) {}

  async registrar(tx: Tx, input: CriarEventoTimelineInput) {
    return this.timeline.criar(tx, input);
  }

  /**
   * Lista eventos do paciente com filtros.
   * Recepção: apenas eventos cadastrais.
   * Clínico: timeline completa (requer timeline.clinica).
   */
  async listarPorPaciente(
    sessao: SessaoUsuario,
    pacienteId: string,
    opts: {
      tipo?: string;
      profissionalId?: string;
      de?: string;
      ate?: string;
      page?: number;
    },
  ) {
    assertPermissao(sessao.perfil, "pacientes.gerenciar");

    const paciente = await this.pacientes.buscarPorId(
      sessao.clinicaId,
      pacienteId,
    );
    if (!paciente) {
      throw new AppError("Paciente não encontrado.", "PACIENTE_NOT_FOUND");
    }

    const clinico =
      ehPerfilClinico(sessao.perfil) &&
      possuiPermissao(sessao.perfil, "timeline.clinica");

    const tiposPermitidos = clinico ? undefined : TIPOS_EVENTO_CADASTRAIS;

    let tipoFiltro: tipo_evento_timeline | "todos" = "todos";
    if (opts.tipo && opts.tipo !== "todos") {
      tipoFiltro = opts.tipo as tipo_evento_timeline;
    }

    const de = opts.de ? parseDataIso(opts.de) : undefined;
    let ate: Date | undefined;
    if (opts.ate) {
      ate = parseDataIso(opts.ate);
      ate = new Date(ate.getTime() + 24 * 60 * 60 * 1000 - 1);
    }

    return this.timeline.listarPorPaciente({
      clinicaId: sessao.clinicaId,
      pacienteId,
      tiposPermitidos,
      tipo: tipoFiltro,
      usuarioId: opts.profissionalId,
      de,
      ate,
      page: opts.page,
    });
  }

  async listarProfissionaisFiltro(sessao: SessaoUsuario) {
    assertPermissao(sessao.perfil, "pacientes.gerenciar");
    return prisma.usuario.findMany({
      where: {
        clinica_id: sessao.clinicaId,
        deleted_at: null,
        ativo: true,
      },
      select: { id: true, nome: true, perfil: true },
      orderBy: { nome: "asc" },
    });
  }

  tiposDisponiveisParaFiltro(sessao: SessaoUsuario): tipo_evento_timeline[] {
    const clinico =
      ehPerfilClinico(sessao.perfil) &&
      possuiPermissao(sessao.perfil, "timeline.clinica");
    if (clinico) {
      return Object.keys(LABELS_TIPO_EVENTO) as TipoEventoTimeline[] as tipo_evento_timeline[];
    }
    return [...TIPOS_EVENTO_CADASTRAIS];
  }
}
