import { prisma } from "@/lib/prisma";
import type { Paciente, Prisma, status_paciente } from "@prisma/client";
import { apenasDigitos } from "@/utils/cpf";

export type ListarPacientesFiltro = {
  clinicaId: string;
  busca?: string;
  status?: status_paciente | "todos";
  page?: number;
  pageSize?: number;
};

export type CriarPacienteData = Omit<
  Prisma.PacienteUncheckedCreateInput,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;

export type AtualizarPacienteData = Partial<
  Omit<
    Prisma.PacienteUncheckedCreateInput,
    "id" | "clinica_id" | "created_at" | "updated_at" | "deleted_at"
  >
>;

type Tx = Prisma.TransactionClient;

export class PacienteRepository {
  async listar(filtro: ListarPacientesFiltro): Promise<{
    items: Paciente[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = Math.max(1, filtro.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, filtro.pageSize ?? 20));
    const busca = filtro.busca?.trim();

    const where: Prisma.PacienteWhereInput = {
      clinica_id: filtro.clinicaId,
      deleted_at: null,
      ...(filtro.status && filtro.status !== "todos"
        ? { status: filtro.status }
        : {}),
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca, mode: "insensitive" } },
              { cpf: { contains: apenasDigitos(busca) } },
              { telefone: { contains: apenasDigitos(busca) } },
              { whatsapp: { contains: apenasDigitos(busca) } },
              { email: { contains: busca, mode: "insensitive" } },
              { diagnostico: { contains: busca, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.paciente.count({ where }),
      prisma.paciente.findMany({
        where,
        orderBy: [{ nome: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { items, total, page, pageSize };
  }

  async buscarPorId(
    clinicaId: string,
    id: string,
  ): Promise<Paciente | null> {
    return prisma.paciente.findFirst({
      where: {
        id,
        clinica_id: clinicaId,
        deleted_at: null,
      },
    });
  }

  async buscarPorCpf(
    clinicaId: string,
    cpf: string,
    ignorarId?: string,
  ): Promise<Paciente | null> {
    return prisma.paciente.findFirst({
      where: {
        clinica_id: clinicaId,
        cpf: apenasDigitos(cpf),
        deleted_at: null,
        ...(ignorarId ? { id: { not: ignorarId } } : {}),
      },
    });
  }

  async criar(tx: Tx, data: CriarPacienteData): Promise<Paciente> {
    return tx.paciente.create({ data });
  }

  async atualizar(
    tx: Tx,
    clinicaId: string,
    id: string,
    data: AtualizarPacienteData,
  ): Promise<Paciente> {
    const existente = await tx.paciente.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) {
      throw new Error("Paciente não encontrado.");
    }
    return tx.paciente.update({
      where: { id },
      data,
    });
  }

  async softDelete(
    tx: Tx,
    clinicaId: string,
    id: string,
  ): Promise<Paciente> {
    const existente = await tx.paciente.findFirst({
      where: { id, clinica_id: clinicaId, deleted_at: null },
    });
    if (!existente) {
      throw new Error("Paciente não encontrado.");
    }

    const agora = new Date();

    await tx.sessao.updateMany({
      where: { clinica_id: clinicaId, paciente_id: id, deleted_at: null },
      data: { deleted_at: agora, status: "cancelada" },
    });
    await tx.anamnese.updateMany({
      where: { clinica_id: clinicaId, paciente_id: id, deleted_at: null },
      data: { deleted_at: agora },
    });
    await tx.avaliacao.updateMany({
      where: { clinica_id: clinicaId, paciente_id: id, deleted_at: null },
      data: { deleted_at: agora },
    });
    await tx.planoTerapeutico.updateMany({
      where: { clinica_id: clinicaId, paciente_id: id, deleted_at: null },
      data: { deleted_at: agora },
    });
    await tx.evolucao.updateMany({
      where: { clinica_id: clinicaId, paciente_id: id, deleted_at: null },
      data: { deleted_at: agora },
    });
    await tx.arquivo.updateMany({
      where: { clinica_id: clinicaId, paciente_id: id, deleted_at: null },
      data: { deleted_at: agora },
    });

    return tx.paciente.update({
      where: { id },
      data: { deleted_at: agora },
    });
  }

  /** Arquivos ainda ativos do paciente (antes do soft-delete em cascata). */
  async listarArquivosAtivos(
    clinicaId: string,
    pacienteId: string,
  ): Promise<{ id: string; storage_key: string }[]> {
    return prisma.arquivo.findMany({
      where: {
        clinica_id: clinicaId,
        paciente_id: pacienteId,
        deleted_at: null,
      },
      select: { id: true, storage_key: true },
    });
  }

  async atualizarStorageKey(
    id: string,
    storageKey: string,
  ): Promise<void> {
    await prisma.arquivo.update({
      where: { id },
      data: { storage_key: storageKey },
    });
  }
}
