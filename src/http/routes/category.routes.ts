import type { FastifyInstance } from "fastify";
import { inject, injectable } from "tsyringe";
import type { CategoryController } from "../controllers/category.controller";
import type { AuthMiddleware } from "../middlewares/auth.middleware";

@injectable()
export class CategoryRoutes {
  constructor(
    @inject("Server") private server: FastifyInstance,
    @inject("CategoryController") private categoryController: CategoryController,
    @inject("AuthMiddleware") private authMiddleware: AuthMiddleware,
  ) { }

  registerRoutes() {
    this.server
      .get(
        "/categories",
        {
          preHandler: this.authMiddleware.handle
        },
        this.categoryController.getAllCategories,
      )
      .post(
        "/categories",
        {
          preHandler: this.authMiddleware.handle,
        },
        this.categoryController.createCategory
      )
      .put(
        "/categories/:id",
        {
          preHandler: this.authMiddleware.handle,
        },
        this.categoryController.updateCategory,
      )
      .delete(
        "/categories/:id",
        {
          preHandler: this.authMiddleware.handle,
        },
        this.categoryController.deleteCategory,
      );
  }
}
