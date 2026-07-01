import { AsyncLocalStorage } from "node:async_hooks";
import { fastify } from "fastify";
import { container } from "tsyringe";
import { AccountRepository } from "@/core/repositories/account.repo";
import { CategoryRepository } from "@/core/repositories/category.repo";
import { RefreshTokenRepository } from "@/core/repositories/refresh-token.repo";
import { UserRepository } from "@/core/repositories/user.repo";
import { AccountService } from "@/core/services/account.service";
import { AuthService } from "@/core/services/auth.service";
import { CategoryService } from "@/core/services/category.service";
import { AccountController } from "@/http/controllers/account.controller";
import { AuthController } from "@/http/controllers/auth.controller";
import { CategoryController } from "@/http/controllers/category.controller";
import { AuthMiddleware } from "@/http/middlewares/auth.middleware";
import { ErrorMiddleware } from "@/http/middlewares/error.middleware";
import { LoggerPlugin } from "@/http/plugins/logger.plugin";
import { SwaggerPlugin } from "@/http/plugins/swagger.plugin";
import { AccountRoutes } from "@/http/routes/account.routes";
import { AuthRoutes } from "@/http/routes/auth.routes";
import { CategoryRoutes } from "@/http/routes/category.routes";
import { ServerRoutes } from "@/http/routes/index.routes";
import { RequestContext } from "@/infra/contexts/request.context";
import { DatabaseConnection } from "@/infra/database";
import { Logger } from "@/infra/logger/logger";
import { JWTProvider } from "@/infra/providers/jwt.provider";
import type { RequestStore } from "@/shared/types/request-store.type";
import { env } from "./env.config";

// #region Infra
container.registerInstance("Env", env);
container.registerSingleton("Database", DatabaseConnection);
container.registerSingleton("Logger", Logger);
container.registerInstance(
  "AsyncLocalStorage",
  new AsyncLocalStorage<RequestStore>(),
);
container.registerSingleton("RequestContext", RequestContext);
container.registerInstance("Server", fastify());
// #endregion Infra

// #region Providers
container.registerSingleton("JWTProvider", JWTProvider);
// #endregion Providers

// #region Repositories
container.registerSingleton("RefreshTokenRepository", RefreshTokenRepository);
container.registerSingleton("UserRepository", UserRepository);
container.registerSingleton("CategoryRepository", CategoryRepository);
container.registerSingleton("AccountRepository", AccountRepository);
// #endregion Repositories

// #region Services
container.registerSingleton("AuthService", AuthService);
container.registerSingleton("CategoryService", CategoryService);
container.registerSingleton("AccountService", AccountService);

// #endregion Services

// #region Controllers
container.registerSingleton("AuthController", AuthController);
container.registerSingleton("CategoryController", CategoryController);
container.registerSingleton("AccountController", AccountController);
// #endregion Controllers

// #region Middlewares
container.registerSingleton("ErrorMiddleware", ErrorMiddleware);
container.registerSingleton("AuthMiddleware", AuthMiddleware);
// #endregion Middlewares

// #region Routes
container.registerSingleton("ServerRoutes", ServerRoutes);
container.registerSingleton("AuthRoutes", AuthRoutes);
container.registerSingleton("CategoryRoutes", CategoryRoutes);
container.registerSingleton("AccountRoutes", AccountRoutes);
// #endregion Routes

// #region Plugins
container.registerSingleton("LoggerPlugin", LoggerPlugin);
container.registerSingleton("SwaggerPlugin", SwaggerPlugin);
// #endregion Plugins

export { container };
