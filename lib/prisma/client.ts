import { PrismaClient } from "@prisma/client";

/**
 * Singleton do PrismaClient (evita múltiplas conexões em hot-reload).
 * Uso exclusivo via repositories — nunca direto em components.
 */

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
