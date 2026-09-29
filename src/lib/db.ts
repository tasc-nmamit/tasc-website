import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

const connectionString = process.env.DATABASE_URL;

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
  });
}

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg(globalForPrisma.pool);
  globalForPrisma.prisma = new PrismaClient({
    adapter,
  });
}

export const db = globalForPrisma.prisma!;

