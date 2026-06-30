import { and, eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";
import type { DatabaseConnection } from "@/infra/database";
import { CategoryModel } from "@/infra/database/models/category.model";

@injectable()
export class CategoryRepository {
  constructor(
    @inject("Database") private database: DatabaseConnection
  ) { }

  async findAllByUser(userId: string) {
    return this
      .database.db
      .select()
      .from(CategoryModel)
      .where(eq(CategoryModel.userId, userId));
  }

  async findById(id: string, userId: string) {
    const [category] = await this
      .database.db
      .select()
      .from(CategoryModel)
      .where(
        and(
          eq(CategoryModel.id, id),
          eq(CategoryModel.userId, userId)
        )
      );

    return category ?? null;
  }

  async create(userId: string, data: { name: string, icon: string, type: "expense" | "income" }) {
    const [category] = await this
      .database.db
      .insert(CategoryModel)
      .values({ ...data, userId })
      .returning();

    return category;
  }

  async createMany(userId: string, data: { name: string, icon: string, type: "expense" | "income" }[]) {
    if (data.length === 0) return;
    const newData = data.map((rs) => ({ ...rs, userId }));
    await this
      .database.db
      .insert(CategoryModel)
      .values(newData);
  }

  async update(id: string, userId: string, data: Partial<{ name: string, icon: string, type: "expense" | "income" }>) {
    const [category] = await this
      .database.db
      .update(CategoryModel)
      .set(data)
      .where(and(
          eq(CategoryModel.id, id),
          eq(CategoryModel.userId, userId)
        ))
      .returning();

    return category ?? null;
  }

  async delete(id: string, userId: string) {
    const { rowCount } = await this
      .database.db
      .delete(CategoryModel)
      .where(and(
        eq(CategoryModel.id, id),
        eq(CategoryModel.userId, userId)
      ));

    return (rowCount ?? 0) > 0;
  }
}
