import { randomUUID } from "node:crypto";
import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
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
    @inject("Server") private server: FastifyInstance,
    @inject("Logger") private logger: Logger,
  ) { }

  registerPlugin() {
    this.server.addHook("onRequest", this.onRequest);
    this.server.addHook("onResponse", this.onResponse);
  }

  private onRequest = (
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

  private onResponse = (
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
