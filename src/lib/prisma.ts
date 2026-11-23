/**
 * ============================================================================
 * MÓDULO DE CONEXÃO COM O BANCO DE DADOS (Prisma Client Singleton)
 * Referência Pedagógica: Receita 22 (Acesso a Banco de Dados no Servidor)
 * ============================================================================
 * Em modo de desenvolvimento (`npm run dev`), o Next.js recarrega módulos
 * frequentemente via Hot Reload. Armazenar a instância do PrismaClient em
 * `globalThis` evita abrir múltiplas conexões simultâneas com o PostgreSQL.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reutiliza a instância existente em desenvolvimento ou cria uma nova
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
