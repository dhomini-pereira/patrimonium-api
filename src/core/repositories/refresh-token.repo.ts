import { eq, lte } from "drizzle-orm";
import { inject, injectable } from "tsyringe";
import type { DatabaseConnection } from "@/infra/database";
import { RefreshTokenModel } from "@/infra/database/models/refresh-token.model";

@injectable()
export class RefreshTokenRepository {
  constructor(
    @inject("Database") private database: DatabaseConnection,
  ) { }

  async create(data: {
    userId: string,
    token: string,
    expiresAt: Date,
  }) {
    const [refreshToken] = await this
      .database.db
      .insert(RefreshTokenModel)
      .values(data)
      .returning();

    return refreshToken ?? null;
  }

  async findByToken(token: string) {
    const [refreshToken] = await this
      .database.db
      .select()
      .from(RefreshTokenModel)
      .where(eq(RefreshTokenModel.token, token));

    return refreshToken ?? null;
  }

  async deleteByToken(token: string) {
    await this
      .database.db
      .delete(RefreshTokenModel)
      .where(eq(RefreshTokenModel.token, token));
  }

  async deleteAllByUser(userId: string) {
    await this
      .database.db
      .delete(RefreshTokenModel)
      .where(eq(RefreshTokenModel.userId, userId));
  }

  async deleteExpired() {
    await this
      .database.db
      .delete(RefreshTokenModel)
      .where(lte(RefreshTokenModel.expiresAt, new Date()));
  }
}
