export interface StorageSignedUrlOptions {
  key: string;
  expirySeconds?: number;
}

export interface StorageUploadOptions {
  key: string;
  contentType: string;
  contentLength?: number;
  metadata?: Record<string, string>;
}

export interface StorageDeleteOptions {
  key: string;
}

export interface StorageHealthResult {
  status: 'ok' | 'error';
  latencyMs: number;
  error?: string;
}
