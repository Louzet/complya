/**
 * Types communs — réponses API et utilitaires
 */

export interface ApiResponse<T> {
  data: T;
  meta?: ResponseMeta;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ResponseMeta {
  requestId?: string;
  timestamp?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: Record<string, string[]>;
}

/** Identifiant cuid (string) */
export type Cuid = string;

/** Code pays ISO 3166-1 alpha-2 */
export type CountryCode = string;

/** Code devise ISO 4217 */
export type CurrencyCode = string;
