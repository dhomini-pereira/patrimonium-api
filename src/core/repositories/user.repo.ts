import { eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";
import type { DatabaseConnection } from "@/infra/database";
import { UserModel } from "@/infra/database/models/user.model";

@injectable()
export class UserRepository {
  constructor(
    @inject("Database") private database: DatabaseConnection,
  ) { }

  async findById(id: string) {
    const [user] = await this
      .database.db
      .select()
      .from(UserModel)
      .where(eq(UserModel.id, id));

    return user ?? null;
  }

  async findByEmail(email: string) {
    const [user] = await this
      .database.db
      .select()
      .from(UserModel)
      .where(eq(UserModel.email, email));

    return user ?? null;
  }

  async create(data: {
    name: string,
    email: string,
    passwordHash: string,
  }) {
    const [user] = await this
      .database.db
      .insert(UserModel)
      .values(data)
      .returning();

    return user ?? null;
  }

  async update(id: string, data: { name?: string, email?: string }) {
    const [user] = await this
      .database.db
      .update(UserModel)
      .set(data)
      .where(eq(UserModel.id, id))
      .returning();

    return user ?? null;
  }
}
