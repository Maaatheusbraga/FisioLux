import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors/app-error";
import { assertPermissao } from "@/lib/auth/permissoes";
import type { SessaoUsuario } from "@/lib/auth/sessao";
import { SessaoRepository } from "@/repositories/sessoes/sessao-repository";
import { PacienteRepository } from "@/repositories/pacientes/paciente-repository";
import { ProtocoloRepository } from "@/repositories/protocolos/protocolo-repository";
import { TimelineService } from "@/services/timeline/timeline-service";
import type { SessaoFormInput } from "@/lib/validations/sessao";
import type { status_sessao } from "@prisma/client";

export class SessaoService {
  constructor(
    private readonly sessoes = new SessaoRepository(),
    private readonly pacientes = new PacienteRepository(),
    private readonly protocolos = new ProtocoloRepository(),
    private readonly timeline = new TimelineService(),
  ) {}

  async listar(
    sessao: SessaoUsuario,
    opts: {
      pacienteId?: string;
      status?: status_sessao | "todos";
      page?: number;
    },
  ) {
    assertPermissao(sessao.perfil, "sessoes.gerenciar");
    return this.sessoes.listar({
      clinicaId: sessao.clinicaId,
      pacienteId: opts.pacienteId,
      status: opts.status,
      page: opts.page,
    });
  }

  async obter(sessaoAuth: SessaoUsuario, id: string) {
    assertPermissao(sessaoAuth.perfil, "sessoes.gerenciar");
    const found = await this.sessoes.buscarPorId(sessaoAuth.clinicaId, id);
    if (!found) {
      throw new AppError("Sessão não encontrada.", "SESSAO_NOT_FOUND");
    }
    return found;
  }

  async listarProtocolosAtivos(sessaoAuth: SessaoUsuario) {
    assertPermissao(sessaoAuth.perfil, "sessoes.gerenciar");
    return this.protocolos.listarAtivos(sessaoAuth.clinicaId);
  }

  async listarProfissionais(sessaoAuth: SessaoUsuario) {
    assertPermissao(sessaoAuth.perfil, "sessoes.gerenciar");
    return prisma.usuario.findMany({
      where: {
        clinica_id: sessaoAuth.clinicaId,
        deleted_at: null,
        ativo: true,
        perfil: { in: ["administrador", "fisioterapeuta"] },
      },
      select: { id: true, nome: true, perfil: true },
      orderBy: { nome: "asc" },
    });
  }

  private async validarEntrada(
    sessaoAuth: SessaoUsuario,
    input: SessaoFormInput,
  ) {
    const paciente = await this.pacientes.buscarPorId(
      sessaoAuth.clinicaId,
      input.paciente_id,
    );
    if (!paciente) {
      throw new AppError("Paciente não encontrado.", "PACIENTE_NOT_FOUND");
    }

    const profissional = await prisma.usuario.findFirst({
      where: {
        id: input.profissional_id,
        clinica_id: sessaoAuth.clinicaId,
        deleted_at: null,
        ativo: true,
      },
    });
    if (!profissional) {
      throw new AppError("Profissional inválido.", "PROFISSIONAL_INVALIDO");
    }

    const okProtocolos = await this.protocolos.validarIdsDaClinica(
      sessaoAuth.clinicaId,
      input.protocolo_ids,
    );
    if (!okProtocolos) {
      throw new AppError(
        "Um ou mais protocolos são inválidos.",
        "PROTOCOLO_INVALIDO",
      );
    }

    return { paciente };
  }

  async criar(sessaoAuth: SessaoUsuario, input: SessaoFormInput) {
    assertPermissao(sessaoAuth.perfil, "sessoes.gerenciar");
    const { paciente } = await this.validarEntrada(sessaoAuth, input);

    return prisma.$transaction(async (tx) => {
      const sessao = await this.sessoes.criar(
        tx,
        {
          clinica_id: sessaoAuth.clinicaId,
          paciente_id: input.paciente_id,
          profissional_id: input.profissional_id,
          realizado_em: new Date(input.realizado_em),
          procedimentos: input.procedimentos,
          equipamentos: input.equipamentos,
          escala_dor: input.escala_dor,
          observacoes: input.observacoes,
          status: input.status,
        },
        input.protocolo_ids,
      );

      await this.timeline.registrar(tx, {
        clinicaId: sessaoAuth.clinicaId,
        pacienteId: paciente.id,
        usuarioId: sessaoAuth.usuarioId,
        tipo: "sessao_criada",
        descricao: `Sessão registrada para ${paciente.nome}${
          input.escala_dor != null ? ` · dor ${input.escala_dor}/10` : ""
        }.`,
        ocorridoEm: sessao.realizado_em,
        sessaoId: sessao.id,
      });

      if (input.protocolo_ids.length > 0) {
        await this.timeline.registrar(tx, {
          clinicaId: sessaoAuth.clinicaId,
          pacienteId: paciente.id,
          usuarioId: sessaoAuth.usuarioId,
          tipo: "protocolo_vinculado",
          descricao: `${input.protocolo_ids.length} protocolo(s) vinculado(s) à sessão.`,
          ocorridoEm: sessao.realizado_em,
          sessaoId: sessao.id,
          metadados: { protocolo_ids: input.protocolo_ids },
        });
      }

      return sessao;
    });
  }

  async atualizar(
    sessaoAuth: SessaoUsuario,
    id: string,
    input: SessaoFormInput,
  ) {
    assertPermissao(sessaoAuth.perfil, "sessoes.gerenciar");
    const { paciente } = await this.validarEntrada(sessaoAuth, input);

    return prisma.$transaction(async (tx) => {
      try {
        const sessao = await this.sessoes.atualizar(
          tx,
          sessaoAuth.clinicaId,
          id,
          {
            profissional_id: input.profissional_id,
            realizado_em: new Date(input.realizado_em),
            procedimentos: input.procedimentos ?? null,
            equipamentos: input.equipamentos ?? null,
            escala_dor: input.escala_dor ?? null,
            observacoes: input.observacoes ?? null,
            status: input.status,
          },
          input.protocolo_ids,
        );

        const tipo =
          input.status === "cancelada" ? "sessao_cancelada" : "sessao_atualizada";

        await this.timeline.registrar(tx, {
          clinicaId: sessaoAuth.clinicaId,
          pacienteId: paciente.id,
          usuarioId: sessaoAuth.usuarioId,
          tipo,
          descricao:
            input.status === "cancelada"
              ? `Sessão de ${paciente.nome} cancelada.`
              : `Sessão de ${paciente.nome} atualizada.`,
          ocorridoEm: new Date(),
          sessaoId: sessao.id,
        });

        return sessao;
      } catch {
        throw new AppError("Sessão não encontrada.", "SESSAO_NOT_FOUND");
      }
    });
  }

  async excluir(sessaoAuth: SessaoUsuario, id: string) {
    assertPermissao(sessaoAuth.perfil, "sessoes.gerenciar");
    const atual = await this.sessoes.buscarPorId(sessaoAuth.clinicaId, id);
    if (!atual) {
      throw new AppError("Sessão não encontrada.", "SESSAO_NOT_FOUND");
    }

    await prisma.$transaction(async (tx) => {
      await this.sessoes.softDelete(tx, sessaoAuth.clinicaId, id);
      await this.timeline.registrar(tx, {
        clinicaId: sessaoAuth.clinicaId,
        pacienteId: atual.paciente_id,
        usuarioId: sessaoAuth.usuarioId,
        tipo: "sessao_cancelada",
        descricao: `Sessão de ${atual.paciente.nome} removida (exclusão lógica).`,
        sessaoId: id,
      });
    });
  }
}
