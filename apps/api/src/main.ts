import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import type { EnvConfig } from './config/env.schema';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false, // Logger NestJS utilisé à la place
    }),
  );

  const config = app.get(ConfigService<EnvConfig, true>);
  const port = config.get('PORT', { infer: true });
  const corsOrigins = config.get('CORS_ORIGINS', { infer: true });
  const nodeEnv = config.get('NODE_ENV', { infer: true });

  // CORS — seules les origines configurées sont autorisées
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Supprime les propriétés non décorées
      forbidNonWhitelisted: true, // Erreur si propriété inconnue
      transform: true,           // Transforme les types automatiquement
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Préfixe global de l'API
  app.setGlobalPrefix('api', {
    exclude: ['health'], // /health reste accessible sans /api
  });

  await app.listen(port, '0.0.0.0');

  logger.log(`Application démarrée en mode ${nodeEnv}`);
  logger.log(`API accessible sur : http://localhost:${port}`);
  logger.log(`Health check : http://localhost:${port}/health`);
}

bootstrap().catch((err) => {
  new Logger('Bootstrap').error('Erreur au démarrage', err);
  process.exit(1);
});
