import { inject, injectable } from "tsyringe";
import type { CategoryRepository } from "../repositories/category.repo";
import { NotFoundError } from "../errors/not-found.error";

@injectable()
export class CategoryService {
  constructor(
    @inject("CategoryRepository") private categoryRepository: CategoryRepository,
  ) { }

  async getAll(userId: string) {
    const categories = await this
      .categoryRepository
      .findAllByUser(userId);

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      type: category.type,
    }));
  }

  async create(userId: string, data: { name: string, icon: string, type: 'expense' | 'income' }) {
    const category = await this
      .categoryRepository
      .create(userId, data);

    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      type: category.type
    }
  }

  async update(id: string, userId: string, data: Partial<{ name: string, icon: string, type: 'income' | 'expense' }>) {
    const category = await this
      .categoryRepository
      .update(id, userId, data);

    if (!category) {
      throw new NotFoundError({
        reason: "Categoria não encontrada.",
        cause: "Categoria não encontrada.",
      });
    }

    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      type: category.type,
    }
  }

  async delete(id: string, userId: string) {
    const category = await this
      .categoryRepository
      .delete(id, userId);

    if (!category) {
      throw new NotFoundError({
        reason: "Categoria não encontrada.",
        cause: "Categoria não encontrada.",
      });
    }
  }
}
