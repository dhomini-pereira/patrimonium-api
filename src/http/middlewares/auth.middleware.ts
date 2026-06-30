import type { FastifyReply, FastifyRequest } from "fastify";
import { inject, injectable } from "tsyringe";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import type { RequestContext } from "@/infra/contexts/request.context";
import type { LoggerInstance } from "@/infra/logger/logger-instance";
import type { JWTProvider } from "@/infra/providers/jwt.provider";

@injectable()
export class AuthMiddleware {
  private logger?: LoggerInstance;
  constructor(
    @inject("RequestContext") private requestContext: RequestContext,
    @inject("JWTProvider") private jwtProvider: JWTProvider,
  ) {
    this.logger = this.requestContext.getLogger()?.child("AuthMiddleware");
  }

  handle = (request: FastifyRequest, _reply: FastifyReply) => {
    const header = request.headers.authorization;

    if (!header || (header && !header.startsWith("Bearer "))) {
      this.logger?.error("Token não fornecido");
      throw new UnauthorizedError({
        reason: "User not authorized.",
        cause: "Token is not provided by client.",
      });
    }

    const token = header.slice(7);

    const payload = this.jwtProvider.verify(token);
    if (!payload.sub) {
      this.logger?.error("Token expirado.");
      throw new UnauthorizedError({
        reason: "Token expirado.",
        cause: "Token expirado."
      });
    }
    request.userId = payload.sub;
  };
}
