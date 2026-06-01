import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { AppModule } from "../src/app.module";

describe("Health Check (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.setGlobalPrefix("api", { exclude: ["health"] });
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health → retourne 200 avec status ok ou degraded", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.payload) as {
      status: string;
      timestamp: string;
      services: {
        database: { status: string };
        r2: { status: string };
        trigger: { status: string };
      };
    };

    expect(["ok", "degraded", "error"]).toContain(body.status);
    expect(body.timestamp).toBeDefined();
    expect(body.services).toBeDefined();
    expect(body.services.database).toBeDefined();
    expect(body.services.r2).toBeDefined();
    expect(body.services.trigger).toBeDefined();
  });

  it("GET /health → les services ont un status valide", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const body = JSON.parse(response.payload) as {
      services: Record<string, { status: string; latencyMs?: number }>;
    };

    for (const service of Object.values(body.services)) {
      expect(["ok", "error"]).toContain(service.status);
    }
  });
});
