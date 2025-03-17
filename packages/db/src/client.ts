import { PrismaClient } from "../generated/client";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

export const prisma = global.cachedPrisma || new PrismaClient({
  log: process.env.DEBUG === "prisma" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") global.cachedPrisma = prisma;
