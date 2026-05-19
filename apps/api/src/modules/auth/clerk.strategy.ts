import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, verifyToken } from '@clerk/backend';
import type { EnvConfig } from '../../config/env.schema';

/**
 * ClerkStrategy — extrait et valide les tokens JWT Clerk.
 * Utilisé par AuthGuard pour hydrater request.auth.
 *
 * NOTE : La logique RBAC (rôles, permissions) est gérée
 * dans des guards NestJS séparés — pas côté Clerk.
 */
@Injectable()
export class ClerkStrategy {
  private readonly clerk: ReturnType<typeof createClerkClient>;
  private readonly secretKey: string;

  constructor(private readonly config: ConfigService<EnvConfig, true>) {
    this.secretKey = this.config.get('CLERK_SECRET_KEY', { infer: true });
    this.clerk = createClerkClient({ secretKey: this.secretKey });
  }

  async verifyToken(token: string): Promise<{ userId: string; sessionId: string }> {
    const payload = await verifyToken(token, { secretKey: this.secretKey });
    return {
      userId: payload.sub,
      sessionId: payload.sid,
    };
  }

  async getUserById(userId: string) {
    return this.clerk.users.getUser(userId);
  }
}
