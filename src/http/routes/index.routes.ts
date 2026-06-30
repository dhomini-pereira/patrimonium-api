import type { FastifyInstance } from "fastify";
import { inject, injectable } from "tsyringe";
import type { ErrorMiddleware } from "../middlewares/error.middleware";
import type { LoggerPlugin } from "../plugins/logger.plugin";
import type { AuthRoutes } from "./auth.routes";
import type { CategoryRoutes } from "./category.routes";

@injectable()
export class ServerRoutes {
  constructor(
    @inject("Server") private server: FastifyInstance,
    @inject("ErrorMiddleware") private errorMiddleware: ErrorMiddleware,
    @inject("LoggerPlugin") private loggerPlugin: LoggerPlugin,
    @inject("AuthRoutes") private authRoutes: AuthRoutes,
    @inject("CategoryRoutes") private categoryRoutes: CategoryRoutes,
  ) {}

  registerRoutes() {
    this.server.setErrorHandler(this.errorMiddleware.handle);
    this.server.addHook("onRequest", this.loggerPlugin.onRequest);
    this.server.addHook("onResponse", this.loggerPlugin.onResponse);

    this.server.get("/health", (_req, reply) => {
      return reply.status(200).send({
        uptime: Date.now(),
        status: "OK",
      });
    });

    this.authRoutes.registerRoutes();
    this.categoryRoutes.registerRoutes();
  }
}
