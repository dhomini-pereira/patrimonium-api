import type { FastifyInstance } from "fastify";
import { inject, injectable } from "tsyringe";
import type { AccountController } from "../controllers/account.controller";
import type { AuthMiddleware } from "../middlewares/auth.middleware";

@injectable()
export class AccountRoutes {
  constructor(
    @inject("Server") private server: FastifyInstance,
    @inject("AuthMiddleware") private authMiddleware: AuthMiddleware,
    @inject("AccountController") private accountController: AccountController
  ) { }

  async registerRoutes() {
    this.server
      .get(
        "/accounts",
        { preHandler: this.authMiddleware.handle },
        this.accountController.getAllAccounts
      )
      .post(
        "/accounts",
        { preHandler: this.authMiddleware.handle },
        this.accountController.createAccount
      )
      .put(
        "/accounts/:id",
        { preHandler: this.authMiddleware.handle },
        this.accountController.updateAccount
      )
      .delete(
        "/accounts/:id",
        { preHandler: this.authMiddleware.handle },
        this.accountController.deleteAccount
      );
  }
}
