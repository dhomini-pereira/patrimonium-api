import type { FastifyReply, FastifyRequest } from "fastify";
import { inject, injectable } from "tsyringe";
import { HTTPError } from "@/core/errors/http.error";
import { InternalServerError } from "@/core/errors/internal-server.error";
import type { CategoryService } from "@/core/services/category.service";

@injectable()
export class CategoryController {
  constructor(
    @inject("CategoryService") private categoryService: CategoryService,
  ) { }

  async getAllCategories(request: FastifyRequest, reply: FastifyReply) {
    try {
      const categories = await this.categoryService.getAll(request.userId);

      return reply.status(200).send(categories);
    } catch (err: unknown) {
      if (err instanceof HTTPError) {
        throw err;
      }

      throw new InternalServerError({
        reason: "Erro interno no servidor.",
        cause: err,
      });
    }
  }

  async createCategory(request: FastifyRequest, reply: FastifyReply) {
    const { name, icon, type } = request.body as { name: string, icon?: string, type: 'income' | 'expense' };

    try {
      const category = await this.categoryService.create(request.userId, {
        name,
        type,
        icon: icon ?? "📋",
      });

      return reply.status(201).send(category);
    } catch (err: unknown) {
      if (err instanceof HTTPError) {
        throw err;
      }

      throw new InternalServerError({
        reason: "Erro interno no servidor.",
        cause: err,
      });
    }
  }

  async updateCategory(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<{ name: string, icon?: string, type: 'income' | 'expense' }>
    try {
      const category = await this.categoryService.update(id, request.userId, data);

      return reply.status(200).send(category);
    } catch (err: unknown) {
      if (err instanceof HTTPError) {
        throw err;
      }

      throw new InternalServerError({
        reason: "Erro interno no servidor.",
        cause: err,
      });
    }
  }

  async deleteCategory(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    try {
      await this.categoryService.delete(id, request.userId);

      return reply.status(204).send();
    } catch (err: unknown) {
      if (err instanceof HTTPError) {
        throw err;
      }

      throw new InternalServerError({
        reason: "Erro interno no servidor.",
        cause: err,
      });
    }
  }
}
