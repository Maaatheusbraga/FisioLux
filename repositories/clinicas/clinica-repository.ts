import { prisma } from "@/lib/prisma";
import type { Clinica, Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export class ClinicaRepository {
  async buscarPorId(id: string): Promise<Clinica | null> {
    return prisma.clinica.findFirst({
      where: { id, deleted_at: null },
    });
  }

  async atualizar(
    tx: Tx,
    id: string,
    data: {
      nome: string;
      cnpj?: string | null;
      telefone?: string | null;
      email?: string | null;
      endereco?: string | null;
      ativa: boolean;
    },
  ) {
    const existente = await tx.clinica.findFirst({
      where: { id, deleted_at: null },
    });
    if (!existente) throw new Error("Clínica não encontrada.");
    return tx.clinica.update({
      where: { id },
      data,
    });
  }
}
