import { and, eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";
import type { DatabaseConnection } from "@/infra/database";
import { AccountModel } from "@/infra/database/models/account.model";
import { asc } from "drizzle-orm";
import { sql } from "drizzle-orm";

@injectable()
export class AccountRepository {
  constructor(
   @inject("Database") private database: DatabaseConnection,
  ) { }

  async findAllByUser(userId: string) {
    const accounts = await this
      .database.db
      .select()
      .from(AccountModel)
      .where(
        eq(AccountModel.userId, userId)
      )
      .orderBy(
        asc(
          AccountModel.createdAt
        )
      );
    return accounts;
  }

  async findById(id: string, userId: string) {
    const [account] = await this
      .database.db
      .select()
      .from(AccountModel)
      .where(
        and(
          eq(AccountModel.id, id),
          eq(AccountModel.userId, userId)
        )
      );

    return account ?? null;
  }

  async create(userId: string, data: { name: string, type: "wallet" | "checking" | "digital" | "investment", balance: number, color: string }) {
    const [account] = await this
      .database.db
      .insert(AccountModel)
      .values({
        ...{ ...data, balance: data.balance.toFixed(2) },
        userId,
      })
      .returning();

    return account;
  }

  async update(id: string, userId: string, data: Partial<{ name: string, type: "wallet" | "checking" | "digital" | "investment", balance: number, color: string }>) {
    const [account] = await this
      .database.db
      .update(AccountModel)
      .set({
        ...{ ...data, balance: data.balance?.toFixed(2) },
      })
      .where(
        and(
          eq(AccountModel.id, id),
          eq(AccountModel.userId, userId)
        )
      )
      .returning();

    return account ?? null;
  }

  async updateBalance(id: string, delta: number) {
    await this
      .database.db
      .update(AccountModel)
      .set({
        balance: sql`${AccountModel.balance} + ${delta}`,
        updatedAt: new Date(),
      })
      .where(
        eq(AccountModel.id, id)
      );
  }

  async delete(id: string, userId: string) {
    const { rowCount } = await this
      .database.db
      .delete(AccountModel)
      .where(
        and(
          eq(AccountModel.id, id),
          eq(AccountModel.userId, userId)
        )
      );

    return (rowCount ?? 0) > 0;
  }
}
