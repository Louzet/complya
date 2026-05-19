import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { configuration } from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  imports: [
    // Configuration globale avec validation Zod au démarrage
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),

    // Rate limiting global
    ThrottlerModule.forRootAsync({
      inject: [],
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env['THROTTLE_TTL'] ?? '60000', 10),
            limit: parseInt(process.env['THROTTLE_LIMIT'] ?? '100', 10),
          },
        ],
      }),
    }),

    // Modules fonctionnels
    AuthModule,
    HealthModule,
    StorageModule,
  ],
})
export class AppModule {}
