import { defineConfig, env } from "prisma/config";
import "dotenv/config";

// DATABASE_URL is required for migrations but Prisma generate can work without it
// We'll use a fallback for generation, but migrations will fail if not set (which is expected)
const databaseUrl = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
  },
});
