import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { configuration } from './config/configuration';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),

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

    PrismaModule,
    AuthModule,
    HealthModule,
    OrganizationModule,
    StorageModule,
  ],
})
export class AppModule {}
