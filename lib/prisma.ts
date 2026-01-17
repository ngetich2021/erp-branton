// lib/prisma.ts  (fixed version)

import { PrismaClient } from "@/app/generated/prisma";  // ← Remove /client if it was there

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);  // add { schema: "public" } if your schema isn't public

// Singleton pattern (good for Next.js hot reload in dev)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;