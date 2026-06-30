import type { FastifyReply, FastifyRequest } from "fastify";
import { injectable } from "tsyringe";
import { HTTPError } from "@/core/errors/http.error";
import { InternalServerError } from "@/core/errors/internal-server.error";

@injectable()
export class ErrorMiddleware {
  handle = (err: unknown, _request: FastifyRequest, reply: FastifyReply) => {
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
