import { randomUUID } from "node:crypto";
import type {
  DoneFuncWithErrOrRes,
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from "fastify";
import { inject, injectable } from "tsyringe";
import type { RequestContext } from "@/infra/contexts/request.context";
import type { Logger } from "@/infra/logger/logger";

@injectable()
export class LoggerPlugin {
  constructor(
    @inject("RequestContext") private requestContext: RequestContext,
    @inject("Logger") private logger: Logger,
  ) {}
  onRequest = (
    request: FastifyRequest,
    _reply: FastifyReply,
    done: DoneFuncWithErrOrRes,
  ) => {
    const requestId = randomUUID();

    const logger = this.logger.create(requestId, "HTTP");

    this.requestContext.run(
      {
        logger: logger,
        requestId: requestId,
      },
      () => {
        logger.info("Request started", {
          method: request.method,
          url: request.url,
        });
        done();
      },
    );
  };

  onResponse = (
    _request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction,
  ) => {
    const logger = this.requestContext.getLogger();

    logger?.info("Request finished", {
      statusCode: reply.statusCode,
    });

    logger?.flush();

    done();
  };
}
