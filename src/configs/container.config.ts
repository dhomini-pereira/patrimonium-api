import { AsyncLocalStorage } from "node:async_hooks";
import { fastify } from "fastify";
import { container } from "tsyringe";
import { LoggerPlugin } from "@/http/plugins/logger.plugin";
import { ServerRoutes } from "@/http/routes/index.routes";
import { RequestContext } from "@/infra/contexts/request.context";
import { DatabaseConnection } from "@/infra/database";
import { Logger } from "@/infra/logger/logger";
import type { RequestStore } from "@/shared/types/request-store.type";
import { env } from "./env.config";

container.registerInstance("Env", env);
container.registerSingleton("Database", DatabaseConnection);
container.registerSingleton("Logger", Logger);
container.registerInstance(
  "AsyncLocalStorage",
  new AsyncLocalStorage<RequestStore>(),
);
container.registerSingleton("RequestContext", RequestContext);
container.registerSingleton("LoggerPlugin", LoggerPlugin);
container.registerInstance("Server", fastify());
container.registerSingleton("ServerRoutes", ServerRoutes);

export { container };
