import type { FastifyInstance } from "fastify";
import { inject, injectable } from "tsyringe";
import type { AuthController } from "../controllers/auth.controller";
import type { AuthMiddleware } from "../middlewares/auth.middleware";

@injectable()
export class AuthRoutes {
  constructor(
    @inject("Server") private server: FastifyInstance,
    @inject("AuthController") private authController: AuthController,
    @inject("AuthMiddleware") private authMiddleware: AuthMiddleware
  ) { }

  registerRoutes() {
    this.server
      .post(
        "/auth/register",
        this.authController.register,
      )
      .post(
        "/auth/login",
        this.authController.login,
      )
      .post(
        "/auth/refresh",
        this.authController.refresh,
      )
      .post(
        "/auth/logout",
        { preHandler: this.authMiddleware.handle },
        this.authController.logout,
      )
      .get(
        "/auth/me",
        { preHandler: this.authMiddleware.handle },
        this.authController.getMe,
      )
      .put(
        "/auth/profile",
        { preHandler: this.authMiddleware.handle },
        this.authController.updateMe,
      );
  }
}
