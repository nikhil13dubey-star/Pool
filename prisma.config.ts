import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "path";

// Load env files so DATABASE_URL is available for Prisma CLI commands
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
