/**
 * Client TS typé pour appeler NestJS depuis Next.js
 *
 * Usage dans un Server Component :
 *   import { createApiClient } from '@complya/sdk';
 *   const api = createApiClient({ token: await getToken() });
 *   const health = await api.health.check();
 *
 * Usage côté client (avec Clerk useAuth) :
 *   const { getToken } = useAuth();
 *   const api = createApiClient({ token: await getToken() });
 */

interface ClientConfig {
  baseUrl?: string;
  token?: string;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export class SdkError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'SdkError';
  }
}

async function sdkFetch<T>(
  baseUrl: string,
  path: string,
  token: string | undefined,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders as Record<string, string>),
  };

  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: response.statusText })) as { message: string };
    throw new SdkError(response.status, error.message);
  }

  return response.json() as Promise<T>;
}

export function createApiClient(config: ClientConfig = {}) {
  const baseUrl =
    config.baseUrl ??
    (typeof window !== 'undefined'
      ? (window as { __NEXT_PUBLIC_API_URL__?: string }).__NEXT_PUBLIC_API_URL__
      : undefined) ??
    'http://localhost:3001';

  const { token } = config;

  const get = <T>(path: string, options?: RequestOptions) =>
    sdkFetch<T>(baseUrl, path, token, { ...options, method: 'GET' });

  const post = <T>(path: string, body: unknown, options?: RequestOptions) =>
    sdkFetch<T>(baseUrl, path, token, { ...options, method: 'POST', body });

  const put = <T>(path: string, body: unknown, options?: RequestOptions) =>
    sdkFetch<T>(baseUrl, path, token, { ...options, method: 'PUT', body });

  const patch = <T>(path: string, body: unknown, options?: RequestOptions) =>
    sdkFetch<T>(baseUrl, path, token, { ...options, method: 'PATCH', body });

  const del = <T>(path: string, options?: RequestOptions) =>
    sdkFetch<T>(baseUrl, path, token, { ...options, method: 'DELETE' });

  return {
    _http: { get, post, put, patch, delete: del },
    // Endpoints nommés
    health: {
      check: () => get('/health'),
    },
    // TODO A02 : organizations, companies, users
    // TODO A04 : obligations
    // TODO A06 : filings
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
