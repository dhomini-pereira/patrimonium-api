import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { inject, injectable } from "tsyringe";
import { HTTPError } from "@/core/errors/http.error";
import { InternalServerError } from "@/core/errors/internal-server.error";
import type { LoggerInstance } from "@/infra/logger/logger-instance";

@injectable()
export class ErrorMiddleware {
  constructor(
    @inject("Logger") private logger: LoggerInstance,
    @inject("Server") private server: FastifyInstance,
  ) { }

  registerMiddleware() {
    this.server.setErrorHandler(this.handle);
  }

  private handle = (err: unknown, _request: FastifyRequest, reply: FastifyReply) => {
    this.logger.error("Error", err);
    if (err instanceof HTTPError) {
      return reply.status(err.statusCode).send({
        message: err.message,
      });
    }

    const newErr = new InternalServerError({
      reason: "Erro interno no servidor.",
      cause: err,
    });

    return reply.status(newErr.statusCode).send({
      message: newErr.message,
    });
  }
}
