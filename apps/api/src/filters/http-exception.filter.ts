import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Stack tracée côté serveur uniquement — jamais exposée au client
    this.logger.error(
      `${request.method} ${request.url} → ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    // 4xx : passe les détails (validation, messages métier)
    // 5xx : toujours générique — jamais de détails internes
    let body: Record<string, unknown>;

    if (exception instanceof HttpException && status < 500) {
      const resp = exception.getResponse();
      body =
        typeof resp === "string"
          ? { statusCode: status, message: resp }
          : { statusCode: status, ...(resp as Record<string, unknown>) };
    } else {
      body = { statusCode: status, message: "Internal server error" };
    }

    reply.status(status).send(body);
  }
}
