import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import type { EnvConfig } from "../../config/env.schema";

interface ServiceHealthResult {
  status: "ok" | "error";
  latencyMs?: number;
}

interface HealthResponse {
  status: "ok" | "degraded" | "error";
  timestamp: string;
}

@Controller("health")
export class HealthController {
  constructor(
    private readonly config: ConfigService<EnvConfig, true>,
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  async check(): Promise<HealthResponse> {
    const [database, r2, trigger] = await Promise.all([
      this.checkDatabase(),
      this.storage.checkHealth(),
      this.checkTrigger(),
    ]);

    const services = { database, r2, trigger };
    const allOk = Object.values(services).every((s) => s.status === "ok");
    const anyOk = Object.values(services).some((s) => s.status === "ok");

    // Pas de détails de services exposés publiquement — topologie interne protégée
    return {
      status: allOk ? "ok" : anyOk ? "degraded" : "error",
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<ServiceHealthResult> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ok", latencyMs: Date.now() - start };
    } catch {
      return { status: "error", latencyMs: Date.now() - start };
    }
  }

  private async checkTrigger(): Promise<ServiceHealthResult> {
    const start = Date.now();
    try {
      const apiUrl = this.config.get("TRIGGER_API_URL", { infer: true });
      const response = await fetch(`${apiUrl}/api/v1/whoami`, {
        headers: {
          Authorization: `Bearer ${this.config.get("TRIGGER_SECRET_KEY", { infer: true })}`,
        },
        signal: AbortSignal.timeout(5000),
      });
      return response.ok
        ? { status: "ok", latencyMs: Date.now() - start }
        : { status: "error", latencyMs: Date.now() - start };
    } catch {
      return { status: "error", latencyMs: Date.now() - start };
    }
  }
}
