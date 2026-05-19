import type { ApiResponse } from '@complya/types';

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: { status: 'ok' | 'error'; latencyMs?: number; error?: string };
    r2: { status: 'ok' | 'error'; latencyMs?: number; error?: string };
    trigger: { status: 'ok' | 'error'; latencyMs?: number; error?: string };
  };
}

export type HealthApiResponse = ApiResponse<HealthCheckResponse>;
