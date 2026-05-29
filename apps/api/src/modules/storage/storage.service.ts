import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  StorageSignedUrlOptions,
  StorageUploadOptions,
  StorageDeleteOptions,
  StorageHealthResult,
} from "./storage.types";
import { EnvConfig } from "../../config/env.schema";

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly expirySeconds: number;

  constructor(private readonly config: ConfigService<EnvConfig, true>) {
    const accountId = this.config.get("R2_ACCOUNT_ID", { infer: true });
    const endpoint = this.config.get("R2_ENDPOINT", { infer: true });

    this.bucket = this.config.get("R2_BUCKET_NAME", { infer: true });
    this.expirySeconds = this.config.get("SIGNED_URL_EXPIRY_SECONDS", {
      infer: true,
    });

    this.client = new S3Client({
      region: "auto",
      endpoint: endpoint ?? `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.config.get("R2_ACCESS_KEY_ID", { infer: true }),
        secretAccessKey: this.config.get("R2_SECRET_ACCESS_KEY", {
          infer: true,
        }),
      },
    });
  }

  /**
   * Génère une signed URL pour upload direct client → R2
   * NestJS ne reçoit que les métadonnées — le fichier transite directement
   */
  async getUploadSignedUrl(options: StorageUploadOptions): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: options.key,
      ContentType: options.contentType,
      ContentLength: options.contentLength,
      Metadata: options.metadata,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: this.expirySeconds,
    });
  }

  /**
   * Génère une signed URL pour téléchargement
   */
  async getDownloadSignedUrl(
    options: StorageSignedUrlOptions,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: options.key,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: options.expirySeconds ?? this.expirySeconds,
    });
  }

  /**
   * Supprime un objet du bucket
   */
  async deleteObject(options: StorageDeleteOptions): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: options.key,
    });

    await this.client.send(command);
  }

  /**
   * Vérifie la connectivité R2 (utilisé par le health check)
   */
  async checkHealth(): Promise<StorageHealthResult> {
    const start = Date.now();
    try {
      // HeadBucket = lecture seule, pas d'écriture, pas de coût R2 Class A
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return { status: "ok", latencyMs: Date.now() - start };
    } catch {
      return { status: "error", latencyMs: Date.now() - start };
    }
  }
}
