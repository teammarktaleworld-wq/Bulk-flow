// prisma.config.ts
// Prisma 7: CLI uses DIRECT_URL (port 5432, bypasses pgbouncer)
// Runtime uses DATABASE_URL (port 6543, pooled) via the adapter in lib/prisma.ts

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL = port 5432, no pgbouncer — needed for prisma db push / migrate
    url: process.env.DIRECT_URL!,
  },
});