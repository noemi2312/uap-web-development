import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"), // Prisma leerá DATABASE_URL de .env
  },
  migrations: {
    path: "prisma/migrations", // ubicación de las migraciones
  },
});
