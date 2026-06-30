import type { FastifyInstance } from "fastify";
import { inject, injectable } from "tsyringe";
import type { ErrorMiddleware } from "../middlewares/error.middleware";
import type { LoggerPlugin } from "../plugins/logger.plugin";
import type { AccountRoutes } from "./account.routes";
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
    @inject("AccountRoutes") private accountRoutes: AccountRoutes,
  ) {}

  registerRoutes() {
    this.server.setErrorHandler(this.errorMiddleware.handle);
    this.server.addHook("onRequest", this.loggerPlugin.onRequest);
    this.server.addHook("onResponse", this.loggerPlugin.onResponse);

    this.server.get("/health", (_req, reply) => {
      const memoryUsage = process.memoryUsage();
      return reply.status(200).send({
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0",
        environment: process.env.NODE_ENV || "development",
        pid: process.pid,
        nodeVersion: process.version,
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
        },
      });
    });

    this.authRoutes.registerRoutes();
    this.categoryRoutes.registerRoutes();
    this.accountRoutes.registerRoutes();
  }
}
