import { inject, injectable } from "tsyringe";
import type { AccountRepository } from "../repositories/account.repo";
import { NotFoundError } from "../errors/not-found.error";

@injectable()
export class AccountService {
  constructor(@inject("AccountRepository") private accountRepository: AccountRepository) {}

  async getAll(userId: string) {
    const accounts = await this.accountRepository.findAllByUser(userId);
    return accounts.map((account) => {
      return {
        id: account.id,
        name: account.name,
        type: account.type,
        balance: Number(account.balance),
        color: account.color,
      };
    });
  }

  async create(userId: string, data: { name: string; type: "wallet" | "checking" | "digital" | "investment"; balance: number; color: string }) {
    const account = await this.accountRepository.create(userId, { ...data });
    return {
      id: account.id,
      name: account.name,
      type: account.type,
      balance: Number(account.balance),
      color: account.color,
    };
  }

  async update(id: string, userId: string, data: Partial<{ name: string; type: "wallet" | "checking" | "digital" | "investment"; balance: number; color: string }>) {
    const account = await this.accountRepository.update(id, userId, { ...data });

    if (!account) {
      throw new NotFoundError({
        reason: "Account not found",
        cause: id,
      });
    };

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      balance: Number(account.balance),
      color: account.color,
    };
  }

  async delete(id: string, userId: string) {
    const account = await this.accountRepository.delete(id, userId);

    if (!account) {
      throw new NotFoundError({
        reason: "Account not found",
        cause: id,
      });
    };
  }
}
