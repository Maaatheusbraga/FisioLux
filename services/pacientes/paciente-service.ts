import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors/app-error";
import { assertPermissao } from "@/lib/auth/permissoes";
import type { SessaoUsuario } from "@/lib/auth/sessao";
import { PacienteRepository } from "@/repositories/pacientes/paciente-repository";
import { TimelineService } from "@/services/timeline/timeline-service";
import { getStorageService } from "@/lib/storage";
import type { PacienteFormInput } from "@/lib/validations/paciente";
import { parseDataIso } from "@/utils/date";
import type { Paciente, status_paciente } from "@prisma/client";

export class PacienteService {
  constructor(
    private readonly pacientes = new PacienteRepository(),
    private readonly timeline = new TimelineService(),
  ) {}

  async listar(
    sessao: SessaoUsuario,
    opts: {
      busca?: string;
      status?: status_paciente | "todos";
      page?: number;
      pageSize?: number;
    },
  ) {
    assertPermissao(sessao.perfil, "pacientes.gerenciar");
    return this.pacientes.listar({
      clinicaId: sessao.clinicaId,
      busca: opts.busca,
      status: opts.status,
      page: opts.page,
      pageSize: opts.pageSize,
    });
  }

  async obter(sessao: SessaoUsuario, id: string): Promise<Paciente> {
    assertPermissao(sessao.perfil, "pacientes.gerenciar");
    const paciente = await this.pacientes.buscarPorId(sessao.clinicaId, id);
    if (!paciente) {
      throw new AppError("Paciente não encontrado.", "PACIENTE_NOT_FOUND");
    }
    return paciente;
  }

  async criar(sessao: SessaoUsuario, input: PacienteFormInput): Promise<Paciente> {
    assertPermissao(sessao.perfil, "pacientes.gerenciar");

    const duplicado = await this.pacientes.buscarPorCpf(
      sessao.clinicaId,
      input.cpf,
    );
    if (duplicado) {
      throw new AppError(
        "Já existe um paciente ativo com este CPF nesta clínica.",
        "PACIENTE_CPF_DUPLICADO",
      );
    }

    return prisma.$transaction(async (tx) => {
      const paciente = await this.pacientes.criar(tx, {
        clinica_id: sessao.clinicaId,
        nome: input.nome,
        cpf: input.cpf,
        rg: input.rg,
        sexo: input.sexo,
        data_nascimento: parseDataIso(input.data_nascimento),
        telefone: input.telefone,
        whatsapp: input.whatsapp,
        email: input.email,
        endereco: input.endereco,
        observacoes: input.observacoes,
        diagnostico: input.diagnostico,
        medicamentos: input.medicamentos,
        alergias: input.alergias,
        historico_medico: input.historico_medico,
        objetivo_tratamento: input.objetivo_tratamento,
        contato_emergencia_nome: input.contato_emergencia_nome,
        contato_emergencia_telefone: input.contato_emergencia_telefone,
        contato_emergencia_parentesco: input.contato_emergencia_parentesco,
        status: input.status,
      });

      await this.timeline.registrar(tx, {
        clinicaId: sessao.clinicaId,
        pacienteId: paciente.id,
        usuarioId: sessao.usuarioId,
        tipo: "paciente_criado",
        descricao: `Paciente ${paciente.nome} cadastrado.`,
      });

      return paciente;
    });
  }

  async atualizar(
    sessao: SessaoUsuario,
    id: string,
    input: PacienteFormInput,
  ): Promise<Paciente> {
    assertPermissao(sessao.perfil, "pacientes.gerenciar");

    const duplicado = await this.pacientes.buscarPorCpf(
      sessao.clinicaId,
      input.cpf,
      id,
    );
    if (duplicado) {
      throw new AppError(
        "Já existe um paciente ativo com este CPF nesta clínica.",
        "PACIENTE_CPF_DUPLICADO",
      );
    }

    return prisma.$transaction(async (tx) => {
      try {
        const paciente = await this.pacientes.atualizar(
          tx,
          sessao.clinicaId,
          id,
          {
            nome: input.nome,
            cpf: input.cpf,
            rg: input.rg ?? null,
            sexo: input.sexo,
            data_nascimento: parseDataIso(input.data_nascimento),
            telefone: input.telefone ?? null,
            whatsapp: input.whatsapp ?? null,
            email: input.email ?? null,
            endereco: input.endereco ?? null,
            observacoes: input.observacoes ?? null,
            diagnostico: input.diagnostico ?? null,
            medicamentos: input.medicamentos ?? null,
            alergias: input.alergias ?? null,
            historico_medico: input.historico_medico ?? null,
            objetivo_tratamento: input.objetivo_tratamento ?? null,
            contato_emergencia_nome: input.contato_emergencia_nome ?? null,
            contato_emergencia_telefone:
              input.contato_emergencia_telefone ?? null,
            contato_emergencia_parentesco:
              input.contato_emergencia_parentesco ?? null,
            status: input.status,
          },
        );

        await this.timeline.registrar(tx, {
          clinicaId: sessao.clinicaId,
          pacienteId: paciente.id,
          usuarioId: sessao.usuarioId,
          tipo: "paciente_atualizado",
          descricao: `Cadastro de ${paciente.nome} atualizado.`,
        });

        return paciente;
      } catch {
        throw new AppError("Paciente não encontrado.", "PACIENTE_NOT_FOUND");
      }
    });
  }

  async excluir(sessao: SessaoUsuario, id: string): Promise<void> {
    assertPermissao(sessao.perfil, "pacientes.gerenciar");

    const arquivos = await this.pacientes.listarArquivosAtivos(
      sessao.clinicaId,
      id,
    );

    await prisma.$transaction(async (tx) => {
      try {
        const paciente = await this.pacientes.softDelete(
          tx,
          sessao.clinicaId,
          id,
        );

        await this.timeline.registrar(tx, {
          clinicaId: sessao.clinicaId,
          pacienteId: paciente.id,
          usuarioId: sessao.usuarioId,
          tipo: "paciente_excluido",
          descricao: `Paciente ${paciente.nome} removido com vínculos clínicos e arquivos (exclusão lógica).`,
        });
      } catch {
        throw new AppError("Paciente não encontrado.", "PACIENTE_NOT_FOUND");
      }
    });

    // Storage fora da transação — best-effort para a lixeira
    if (arquivos.length > 0) {
      const storage = getStorageService();
      for (const arq of arquivos) {
        try {
          const moved = await storage.moveToTrash(arq.storage_key);
          await this.pacientes.atualizarStorageKey(arq.id, moved.storageKey);
        } catch {
          // metadados já estão soft-deleted
        }
      }
    }
  }
}
