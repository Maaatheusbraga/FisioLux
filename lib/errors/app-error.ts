import { Prisma } from "@prisma/client";

export class AppError extends Error {
  readonly code: string;

  constructor(message: string, code = "APP_ERROR") {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

function mensagemPrisma(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "Já existe um registro com esses dados (CPF ou e-mail duplicado).";
    }
    if (error.code === "P2025") {
      return "Registro não encontrado.";
    }
    return "Não foi possível salvar. Tente novamente.";
  }
  return null;
}

/** Mensagem segura para a UI. Nunca devolve texto interno (Prisma, Storage, stack). */
export function mensagemDeErro(error: unknown, fallback: string): string {
  if (error instanceof AppError) {
    return error.message;
  }
  const prisma = mensagemPrisma(error);
  if (prisma) return prisma;
  return fallback;
}
