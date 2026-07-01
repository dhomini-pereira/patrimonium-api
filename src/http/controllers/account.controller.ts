import type { FastifyReply, FastifyRequest } from "fastify";
import { inject, injectable } from "tsyringe";
import type { AccountService } from "@/core/services/account.service";

@injectable()
export class AccountController {
  constructor(
    @inject("AccountService") private accountService: AccountService
  ) { }

  async getAllAccounts(request: FastifyRequest, reply: FastifyReply) {
    const accounts = await this.accountService.getAll(request.userId);
    return reply.status(200).send(accounts);
  }

  async createAccount(request: FastifyRequest, reply: FastifyReply) {
    const { name, type, balance, color } = request.body as { name: string; type: "wallet" | "checking" | "digital" | "investment"; balance: number; color: string };
    const account = await this.accountService.create(request.userId, { name, type, balance, color: color ?? '#2563eb' });

    return reply.status(201).send(account);
  }

  async updateAccount(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { name, type, balance, color } = request.body as { name: string; type: "wallet" | "checking" | "digital" | "investment"; balance: number; color: string };
    const account = await this.accountService.update(request.userId, id, { name, type, balance, color: color });

    return reply.status(200).send(account);
  }

  async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await this.accountService.delete(request.userId, id);

    return reply.status(204).send();
  }
}
