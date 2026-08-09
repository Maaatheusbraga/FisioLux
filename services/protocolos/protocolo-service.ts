import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors/app-error";
import { assertPermissao } from "@/lib/auth/permissoes";
import type { SessaoUsuario } from "@/lib/auth/sessao";
import { ProtocoloRepository } from "@/repositories/protocolos/protocolo-repository";
import type { ProtocoloFormInput } from "@/lib/validations/protocolo";
import type { Protocolo } from "@prisma/client";

/**
 * Protocolos são modelos da clínica (sem paciente).
 * A Timeline do paciente só recebe `protocolo_vinculado` ao vincular em sessão (Fase 7).
 * Tipos `protocolo_criado` / `protocolo_atualizado` existem no enum para uso futuro
 * (ex.: feed clínico da clínica); CRUD aqui não inventa paciente_id.
 */
export class ProtocoloService {
  constructor(private readonly protocolos = new ProtocoloRepository()) {}

  async listar(
    sessao: SessaoUsuario,
    opts: {
      busca?: string;
      ativo?: boolean | "todos";
      page?: number;
    },
  ) {
    assertPermissao(sessao.perfil, "protocolos.gerenciar");
    return this.protocolos.listar({
      clinicaId: sessao.clinicaId,
      busca: opts.busca,
      ativo: opts.ativo,
      page: opts.page,
    });
  }

  async obter(sessao: SessaoUsuario, id: string): Promise<Protocolo> {
    assertPermissao(sessao.perfil, "protocolos.gerenciar");
    const found = await this.protocolos.buscarPorId(sessao.clinicaId, id);
    if (!found) {
      throw new AppError("Protocolo não encontrado.", "PROTOCOLO_NOT_FOUND");
    }
    return found;
  }

  async criar(
    sessao: SessaoUsuario,
    input: ProtocoloFormInput,
  ): Promise<Protocolo> {
    assertPermissao(sessao.perfil, "protocolos.gerenciar");

    return prisma.$transaction(async (tx) => {
      return this.protocolos.criar(tx, {
        clinica_id: sessao.clinicaId,
        nome: input.nome,
        descricao: input.descricao,
        objetivo: input.objetivo,
        tempo_estimado: input.tempo_estimado,
        observacoes: input.observacoes,
        categorias: input.categorias,
        ativo: input.ativo,
      });
    });
  }

  async atualizar(
    sessao: SessaoUsuario,
    id: string,
    input: ProtocoloFormInput,
  ): Promise<Protocolo> {
    assertPermissao(sessao.perfil, "protocolos.gerenciar");

    return prisma.$transaction(async (tx) => {
      try {
        return await this.protocolos.atualizar(tx, sessao.clinicaId, id, {
          nome: input.nome,
          descricao: input.descricao ?? null,
          objetivo: input.objetivo ?? null,
          tempo_estimado: input.tempo_estimado ?? null,
          observacoes: input.observacoes ?? null,
          categorias: input.categorias,
          ativo: input.ativo,
        });
      } catch {
        throw new AppError("Protocolo não encontrado.", "PROTOCOLO_NOT_FOUND");
      }
    });
  }

  async excluir(sessao: SessaoUsuario, id: string): Promise<void> {
    assertPermissao(sessao.perfil, "protocolos.gerenciar");
    const atual = await this.protocolos.buscarPorId(sessao.clinicaId, id);
    if (!atual) {
      throw new AppError("Protocolo não encontrado.", "PROTOCOLO_NOT_FOUND");
    }

    await prisma.$transaction(async (tx) => {
      await this.protocolos.softDelete(tx, sessao.clinicaId, id);
    });
  }
}
