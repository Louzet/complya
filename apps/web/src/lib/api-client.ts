/**
 * api-client.ts — Client fetch léger vers NestJS
 *
 * Wrapper minimal autour de fetch avec :
 * - Injection automatique du token Clerk depuis les Server Components
 * - Gestion des erreurs structurée
 * - Typage générique des réponses
 *
 * NOTE : Ce fichier est utilisé côté serveur (Server Components, Server Actions)
 * Pour le client, utiliser packages/sdk
 */

interface ApiClientOptions extends Omit<RequestInit, "body"> {
  token?: string;
  body?: unknown;
}

interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export class ApiClientError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: ApiError,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const API_URL = process.env["NEXT_PUBLIC_API_URL"];
if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL est requis. Vérifier apps/web/.env.local",
  );
}

async function apiFetch<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const apiUrl = API_URL;
  const { token, body, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders as Record<string, string>),
  };

  const response = await fetch(`${apiUrl}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({
      statusCode: response.status,
      message: response.statusText,
    }))) as ApiError;

    throw new ApiClientError(response.status, error.message, error);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: ApiClientOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body: unknown, options?: ApiClientOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body: unknown, options?: ApiClientOptions) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(path: string, body: unknown, options?: ApiClientOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: ApiClientOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
