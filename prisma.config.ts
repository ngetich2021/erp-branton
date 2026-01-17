// prisma.config.ts
// This configures Prisma CLI commands (prisma generate, prisma migrate, etc.)
// It loads .env automatically and provides the connection URL for migrations / introspection

import "dotenv/config"; // Loads .env → process.env.DATABASE_URL
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",          // Path to your schema
  migrations: {
    path: "prisma/migrations",             // Where migration files live
    // seed: "tsx prisma/seed.ts",         // Uncomment if you have a seed script
  },
  datasource: {
    url: env("DATABASE_URL"),              // Required for CLI ops (migrate dev/reset/push)
    // shadowDatabaseUrl: env("SHADOW_DATABASE_URL"), // optional, for faster migrate diff
  },
  // experimental: { externalTables: true }, // if you have tables Prisma shouldn't manage
});