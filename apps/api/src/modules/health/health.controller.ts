import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import type { EnvConfig } from '../../config/env.schema';

interface ServiceHealthResult {
  status: 'ok' | 'error';
  latencyMs?: number;
  error?: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: ServiceHealthResult;
    r2: ServiceHealthResult;
    trigger: ServiceHealthResult;
  };
}

@Controller('health')
export class HealthController {
  private readonly prisma: PrismaClient;

  constructor(private readonly config: ConfigService<EnvConfig, true>) {
    this.prisma = new PrismaClient({
      datasources: {
        db: { url: this.config.get('DATABASE_URL', { infer: true }) },
      },
    });
  }

  @Get()
  async check(): Promise<HealthResponse> {
    const [database, r2, trigger] = await Promise.all([
      this.checkDatabase(),
      this.checkR2(),
      this.checkTrigger(),
    ]);

    const services = { database, r2, trigger };
    const allOk = Object.values(services).every((s) => s.status === 'ok');
    const anyOk = Object.values(services).some((s) => s.status === 'ok');

    return {
      status: allOk ? 'ok' : anyOk ? 'degraded' : 'error',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] ?? '0.0.0',
      environment: this.config.get('NODE_ENV', { infer: true }),
      services,
    };
  }

  private async checkDatabase(): Promise<ServiceHealthResult> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch (error) {
      return {
        status: 'error',
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'DB unreachable',
      };
    }
  }

  private async checkR2(): Promise<ServiceHealthResult> {
    const start = Date.now();
    try {
      const endpoint = this.config.get('R2_ENDPOINT', { infer: true });
      // Simple HEAD request sur l'endpoint R2 pour vérifier la connectivité réseau
      const response = await fetch(endpoint, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      // R2 renvoie 403 (pas 404 ni réseau mort) quand le endpoint est valide
      const ok = response.status !== 0;
      return ok
        ? { status: 'ok', latencyMs: Date.now() - start }
        : { status: 'error', latencyMs: Date.now() - start, error: 'R2 unreachable' };
    } catch (error) {
      return {
        status: 'error',
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'R2 unreachable',
      };
    }
  }

  private async checkTrigger(): Promise<ServiceHealthResult> {
    const start = Date.now();
    try {
      const apiUrl = this.config.get('TRIGGER_API_URL', { infer: true });
      const response = await fetch(`${apiUrl}/api/v1/whoami`, {
        headers: {
          Authorization: `Bearer ${this.config.get('TRIGGER_SECRET_KEY', { infer: true })}`,
        },
        signal: AbortSignal.timeout(5000),
      });
      return response.ok
        ? { status: 'ok', latencyMs: Date.now() - start }
        : { status: 'error', latencyMs: Date.now() - start, error: `HTTP ${response.status}` };
    } catch (error) {
      return {
        status: 'error',
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'Trigger.dev unreachable',
      };
    }
  }
}
