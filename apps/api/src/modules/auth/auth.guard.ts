import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import type { EnvConfig } from '../../config/env.schema';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly secretKey: string;

  constructor(private readonly config: ConfigService<EnvConfig, true>) {
    this.secretKey = this.config.get('CLERK_SECRET_KEY', { infer: true });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string>;
      auth?: { userId: string; sessionId: string };
    }>();

    const authHeader = request.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token d\'authentification manquant');
    }

    const token = authHeader.slice(7);

    try {
      const { sub: userId, sid: sessionId } = await verifyToken(token, { secretKey: this.secretKey });
      // Attacher les infos d'auth à la requête pour les controllers/services
      request.auth = { userId, sessionId };
      return true;
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }
}
