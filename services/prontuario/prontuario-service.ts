import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors/app-error";
import { assertPermissao } from "@/lib/auth/permissoes";
import type { SessaoUsuario } from "@/lib/auth/sessao";
import { PacienteRepository } from "@/repositories/pacientes/paciente-repository";
import { ProntuarioRepository } from "@/repositories/prontuario/prontuario-repository";
import { TimelineService } from "@/services/timeline/timeline-service";
import { parseDataIso } from "@/utils/date";
import type {
  AltaFormInput,
  AvaliacaoFormInput,
  EvolucaoFormInput,
  PlanoFormInput,
} from "@/lib/validations/prontuario";

export class ProntuarioService {
  constructor(
    private readonly prontuario = new ProntuarioRepository(),
    private readonly pacientes = new PacienteRepository(),
    private readonly timeline = new TimelineService(),
  ) {}

  private async exigirPaciente(sessao: SessaoUsuario, pacienteId: string) {
    assertPermissao(sessao.perfil, "prontuario.acessar");
    const paciente = await this.pacientes.buscarPorId(
      sessao.clinicaId,
      pacienteId,
    );
    if (!paciente) {
      throw new AppError("Paciente não encontrado.", "PACIENTE_NOT_FOUND");
    }
    return paciente;
  }

  async obterPainel(sessao: SessaoUsuario, pacienteId: string) {
    const paciente = await this.exigirPaciente(sessao, pacienteId);
    const dados = await this.prontuario.listarPorPaciente(
      sessao.clinicaId,
      pacienteId,
      { limiteEvolucoes: 200 },
    );
    return { paciente, ...dados };
  }

  // ── Avaliação ─────────────────────────────────────────

  async obterAvaliacao(sessao: SessaoUsuario, id: string) {
    assertPermissao(sessao.perfil, "prontuario.acessar");
    const item = await this.prontuario.buscarAvaliacao(sessao.clinicaId, id);
    if (!item) {
      throw new AppError("Avaliação não encontrada.", "AVALIACAO_NOT_FOUND");
    }
    return item;
  }

  async criarAvaliacao(sessao: SessaoUsuario, input: AvaliacaoFormInput) {
    const paciente = await this.exigirPaciente(sessao, input.paciente_id);

    return prisma.$transaction(async (tx) => {
      const registro = await this.prontuario.criarAvaliacao(tx, {
        clinica_id: sessao.clinicaId,
        paciente_id: paciente.id,
        usuario_id: sessao.usuarioId,
        tipo: input.tipo,
        data_avaliacao: parseDataIso(input.data_avaliacao),
        queixa_principal: input.queixa_principal,
        exame_fisico: input.exame_fisico,
        diagnostico_fisioterapeutico: input.diagnostico_fisioterapeutico,
        objetivos: input.objetivos,
        observacoes: input.observacoes,
        dados_complementares: input.dados_complementares,
      });

      await this.timeline.registrar(tx, {
        clinicaId: sessao.clinicaId,
        pacienteId: paciente.id,
        usuarioId: sessao.usuarioId,
        tipo: "avaliacao_criada",
        descricao: input.dados_complementares?.recovery
          ? `Recovery registrado para ${paciente.nome}.`
          : `Avaliação ${input.tipo} registrada para ${paciente.nome}.`,
        ocorridoEm: new Date(),
        avaliacaoId: registro.id,
      });

      return registro;
    });
  }

  async atualizarAvaliacao(
    sessao: SessaoUsuario,
    id: string,
    input: AvaliacaoFormInput,
  ) {
    const paciente = await this.exigirPaciente(sessao, input.paciente_id);
    const existente = await this.prontuario.buscarAvaliacao(
      sessao.clinicaId,
      id,
    );
    if (!existente) {
      throw new AppError("Avaliação não encontrada.", "AVALIACAO_NOT_FOUND");
    }

    const anterior =
      existente.dados_complementares &&
      typeof existente.dados_complementares === "object"
        ? (existente.dados_complementares as Record<string, unknown>)
        : {};
    const recovery = Boolean(input.dados_complementares?.recovery);
    const dadosComplementares = input.dados_complementares
      ? recovery
        ? { ...anterior, recovery: true }
        : {
            ...input.dados_complementares,
            ...(anterior.ultrassonografia
              ? { ultrassonografia: anterior.ultrassonografia }
              : {}),
            recovery: false,
          }
      : input.dados_complementares;

    return prisma.$transaction(async (tx) => {
      try {
        const registro = await this.prontuario.atualizarAvaliacao(
          tx,
          sessao.clinicaId,
          id,
          {
            tipo: input.tipo,
            data_avaliacao: parseDataIso(input.data_avaliacao),
            queixa_principal: recovery
              ? existente.queixa_principal
              : (input.queixa_principal ?? null),
            exame_fisico: recovery
              ? existente.exame_fisico
              : (input.exame_fisico ?? null),
            diagnostico_fisioterapeutico: recovery
              ? existente.diagnostico_fisioterapeutico
              : (input.diagnostico_fisioterapeutico ?? null),
            objetivos: recovery
              ? existente.objetivos
              : (input.objetivos ?? null),
            observacoes: input.observacoes ?? null,
            dados_complementares: dadosComplementares ?? null,
          },
        );

        await this.timeline.registrar(tx, {
          clinicaId: sessao.clinicaId,
          pacienteId: paciente.id,
          usuarioId: sessao.usuarioId,
          tipo: "avaliacao_atualizada",
          descricao: `Avaliação de ${paciente.nome} atualizada.`,
          avaliacaoId: registro.id,
        });

        return registro;
      } catch {
        throw new AppError("Avaliação não encontrada.", "AVALIACAO_NOT_FOUND");
      }
    });
  }

  async excluirAvaliacao(
    sessao: SessaoUsuario,
    id: string,
    pacienteId: string,
  ) {
    const paciente = await this.exigirPaciente(sessao, pacienteId);

    await prisma.$transaction(async (tx) => {
      try {
        await this.prontuario.softDeleteAvaliacao(tx, sessao.clinicaId, id);
        await this.timeline.registrar(tx, {
          clinicaId: sessao.clinicaId,
          pacienteId: paciente.id,
          usuarioId: sessao.usuarioId,
          tipo: "avaliacao_atualizada",
          descricao: `Avaliação de ${paciente.nome} removida (exclusão lógica).`,
          avaliacaoId: id,
        });
      } catch {
        throw new AppError("Avaliação não encontrada.", "AVALIACAO_NOT_FOUND");
      }
    });
  }

  // ── Plano ─────────────────────────────────────────────

  async obterPlano(sessao: SessaoUsuario, id: string) {
    assertPermissao(sessao.perfil, "prontuario.acessar");
    const item = await this.prontuario.buscarPlano(sessao.clinicaId, id);
    if (!item) {
      throw new AppError(
        "Plano terapêutico não encontrado.",
        "PLANO_NOT_FOUND",
      );
    }
    return item;
  }

  async criarPlano(sessao: SessaoUsuario, input: PlanoFormInput) {
    const paciente = await this.exigirPaciente(sessao, input.paciente_id);

    return prisma.$transaction(async (tx) => {
      const registro = await this.prontuario.criarPlano(tx, {
        clinica_id: sessao.clinicaId,
        paciente_id: paciente.id,
        usuario_id: sessao.usuarioId,
        data_plano: parseDataIso(input.data_plano),
        objetivos: input.objetivos,
        condutas: input.condutas,
        frequencia_sugerida: input.frequencia_sugerida,
        previsao_sessoes: input.previsao_sessoes,
        observacoes: input.observacoes,
      });

      await this.timeline.registrar(tx, {
        clinicaId: sessao.clinicaId,
        pacienteId: paciente.id,
        usuarioId: sessao.usuarioId,
        tipo: "plano_terapeutico_criado",
        descricao: `Plano terapêutico criado para ${paciente.nome}.`,
        ocorridoEm: new Date(),
        planoTerapeuticoId: registro.id,
      });

      return registro;
    });
  }

  async atualizarPlano(
    sessao: SessaoUsuario,
    id: string,
    input: PlanoFormInput,
  ) {
    const paciente = await this.exigirPaciente(sessao, input.paciente_id);

    return prisma.$transaction(async (tx) => {
      try {
        const registro = await this.prontuario.atualizarPlano(
          tx,
          sessao.clinicaId,
          id,
          {
            data_plano: parseDataIso(input.data_plano),
            objetivos: input.objetivos ?? null,
            condutas: input.condutas ?? null,
            frequencia_sugerida: input.frequencia_sugerida ?? null,
            previsao_sessoes: input.previsao_sessoes ?? null,
            observacoes: input.observacoes ?? null,
          },
        );

        await this.timeline.registrar(tx, {
          clinicaId: sessao.clinicaId,
          pacienteId: paciente.id,
          usuarioId: sessao.usuarioId,
          tipo: "plano_terapeutico_atualizado",
          descricao: `Plano terapêutico de ${paciente.nome} atualizado.`,
          planoTerapeuticoId: registro.id,
        });

        return registro;
      } catch {
        throw new AppError(
          "Plano terapêutico não encontrado.",
          "PLANO_NOT_FOUND",
        );
      }
    });
  }

  async excluirPlano(sessao: SessaoUsuario, id: string, pacienteId: string) {
    const paciente = await this.exigirPaciente(sessao, pacienteId);

    await prisma.$transaction(async (tx) => {
      try {
        await this.prontuario.softDeletePlano(tx, sessao.clinicaId, id);
        await this.timeline.registrar(tx, {
          clinicaId: sessao.clinicaId,
          pacienteId: paciente.id,
          usuarioId: sessao.usuarioId,
          tipo: "plano_terapeutico_atualizado",
          descricao: `Plano terapêutico de ${paciente.nome} removido (exclusão lógica).`,
          planoTerapeuticoId: id,
        });
      } catch {
        throw new AppError(
          "Plano terapêutico não encontrado.",
          "PLANO_NOT_FOUND",
        );
      }
    });
  }

  // ── Evolução ──────────────────────────────────────────

  async obterEvolucao(sessao: SessaoUsuario, id: string) {
    assertPermissao(sessao.perfil, "prontuario.acessar");
    const item = await this.prontuario.buscarEvolucao(sessao.clinicaId, id);
    if (!item) {
      throw new AppError("Evolução não encontrada.", "EVOLUCAO_NOT_FOUND");
    }
    return item;
  }

  async criarEvolucao(sessao: SessaoUsuario, input: EvolucaoFormInput) {
    const paciente = await this.exigirPaciente(sessao, input.paciente_id);

    return prisma.$transaction(async (tx) => {
      const registro = await this.prontuario.criarEvolucao(tx, {
        clinica_id: sessao.clinicaId,
        paciente_id: paciente.id,
        usuario_id: sessao.usuarioId,
        data_evolucao: parseDataIso(input.data_evolucao),
        descricao: input.descricao,
        escala_dor: input.escala_dor,
        observacoes: input.observacoes,
      });

      await this.timeline.registrar(tx, {
        clinicaId: sessao.clinicaId,
        pacienteId: paciente.id,
        usuarioId: sessao.usuarioId,
        tipo: "evolucao_criada",
        descricao: `Evolução registrada para ${paciente.nome}${
          input.escala_dor != null ? ` · dor ${input.escala_dor}/10` : ""
        }.`,
        ocorridoEm: new Date(),
        evolucaoId: registro.id,
      });

      return registro;
    });
  }

  async atualizarEvolucao(
    sessao: SessaoUsuario,
    id: string,
    input: EvolucaoFormInput,
  ) {
    const paciente = await this.exigirPaciente(sessao, input.paciente_id);

    return prisma.$transaction(async (tx) => {
      try {
        const registro = await this.prontuario.atualizarEvolucao(
          tx,
          sessao.clinicaId,
          id,
          {
            data_evolucao: parseDataIso(input.data_evolucao),
            descricao: input.descricao,
            escala_dor: input.escala_dor ?? null,
            observacoes: input.observacoes ?? null,
          },
        );

        await this.timeline.registrar(tx, {
          clinicaId: sessao.clinicaId,
          pacienteId: paciente.id,
          usuarioId: sessao.usuarioId,
          tipo: "evolucao_atualizada",
          descricao: `Evolução de ${paciente.nome} atualizada.`,
          evolucaoId: registro.id,
        });

        return registro;
      } catch {
        throw new AppError("Evolução não encontrada.", "EVOLUCAO_NOT_FOUND");
      }
    });
  }

  async excluirEvolucao(
    sessao: SessaoUsuario,
    id: string,
    pacienteId: string,
  ) {
    const paciente = await this.exigirPaciente(sessao, pacienteId);

    await prisma.$transaction(async (tx) => {
      try {
        await this.prontuario.softDeleteEvolucao(tx, sessao.clinicaId, id);
        await this.timeline.registrar(tx, {
          clinicaId: sessao.clinicaId,
          pacienteId: paciente.id,
          usuarioId: sessao.usuarioId,
          tipo: "evolucao_atualizada",
          descricao: `Evolução de ${paciente.nome} removida (exclusão lógica).`,
          evolucaoId: id,
        });
      } catch {
        throw new AppError("Evolução não encontrada.", "EVOLUCAO_NOT_FOUND");
      }
    });
  }

  // ── Alta / reabertura ─────────────────────────────────

  async registrarAlta(sessao: SessaoUsuario, input: AltaFormInput) {
    const paciente = await this.exigirPaciente(sessao, input.paciente_id);

    if (paciente.status === "alta") {
      throw new AppError(
        "Paciente já está com status de alta.",
        "PACIENTE_JA_ALTA",
      );
    }

    const ativa = await this.prontuario.buscarAltaAtiva(
      sessao.clinicaId,
      paciente.id,
    );
    if (ativa) {
      throw new AppError(
        "Já existe uma alta ativa para este paciente.",
        "ALTA_ATIVA",
      );
    }

    return prisma.$transaction(async (tx) => {
      const registro = await this.prontuario.criarAlta(tx, {
        clinica_id: sessao.clinicaId,
        paciente_id: paciente.id,
        usuario_id: sessao.usuarioId,
        data_alta: parseDataIso(input.data_alta),
        motivo: input.motivo,
        observacoes: input.observacoes,
      });

      await this.prontuario.atualizarStatusPaciente(
        tx,
        sessao.clinicaId,
        paciente.id,
        "alta",
      );

      await this.timeline.registrar(tx, {
        clinicaId: sessao.clinicaId,
        pacienteId: paciente.id,
        usuarioId: sessao.usuarioId,
        tipo: "alta_registrada",
        descricao: `Alta registrada para ${paciente.nome}${
          input.motivo ? ` · ${input.motivo}` : ""
        }.`,
        ocorridoEm: new Date(),
        altaId: registro.id,
      });

      return registro;
    });
  }

  async reabrirTratamento(sessao: SessaoUsuario, pacienteId: string) {
    const paciente = await this.exigirPaciente(sessao, pacienteId);

    if (paciente.status !== "alta") {
      throw new AppError(
        "Somente pacientes em alta podem ter o tratamento reaberto.",
        "PACIENTE_NAO_ALTA",
      );
    }

    const ativa = await this.prontuario.buscarAltaAtiva(
      sessao.clinicaId,
      paciente.id,
    );
    if (!ativa) {
      throw new AppError(
        "Nenhuma alta ativa encontrada para reabrir.",
        "ALTA_NAO_ENCONTRADA",
      );
    }

    return prisma.$transaction(async (tx) => {
      const registro = await this.prontuario.reabrirAlta(
        tx,
        sessao.clinicaId,
        ativa.id,
        sessao.usuarioId,
      );

      await this.prontuario.atualizarStatusPaciente(
        tx,
        sessao.clinicaId,
        paciente.id,
        "em_tratamento",
      );

      await this.timeline.registrar(tx, {
        clinicaId: sessao.clinicaId,
        pacienteId: paciente.id,
        usuarioId: sessao.usuarioId,
        tipo: "tratamento_reaberto",
        descricao: `Tratamento de ${paciente.nome} reaberto.`,
        altaId: registro.id,
      });

      return registro;
    });
  }
}
