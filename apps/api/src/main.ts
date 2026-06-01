import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger, type LogLevel } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./filters/http-exception.filter";
import type { EnvConfig } from "./config/env.schema";

// LOG_LEVEL lu directement — ConfigService pas encore disponible avant NestFactory.create
const LOG_LEVEL_MAP: Record<string, LogLevel[]> = {
  debug: ["debug", "verbose", "log", "warn", "error", "fatal"],
  info: ["log", "warn", "error", "fatal"],
  warn: ["warn", "error", "fatal"],
  error: ["error", "fatal"],
};
const nestLogLevels: LogLevel[] =
  LOG_LEVEL_MAP[process.env["LOG_LEVEL"] ?? "info"] ?? LOG_LEVEL_MAP["info"];

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { logger: nestLogLevels },
  );

  const config = app.get(ConfigService<EnvConfig, true>);
  const port = config.get("PORT", { infer: true });
  const apiUrl = config.get("API_URL", { infer: true });
  const corsOrigins = config.get("CORS_ORIGINS", { infer: true });
  const nodeEnv = config.get("NODE_ENV", { infer: true });

  // CORS — seules les origines configurées sont autorisées
  app.enableCors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-tenant-id"],
    credentials: true,
  });

  // Filtre global — stack traces jamais exposées au client (CLAUDE.md)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non décorées
      forbidNonWhitelisted: true, // Erreur si propriété inconnue
      transform: true, // Transforme les types automatiquement
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Préfixe global de l'API
  app.setGlobalPrefix("api", {
    exclude: ["health"], // /health reste accessible sans /api
  });

  await app.listen(port, "0.0.0.0");

  logger.log(`Application démarrée en mode ${nodeEnv}`);
  logger.log(`API accessible sur : ${apiUrl}`);
  logger.log(`Health check : ${apiUrl}/health`);
}

bootstrap().catch((err) => {
  new Logger("Bootstrap").error("Erreur au démarrage", err);
  process.exit(1);
});
