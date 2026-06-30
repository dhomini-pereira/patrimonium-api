import type { FastifyReply, FastifyRequest } from "fastify";
import { inject, injectable } from "tsyringe";
import { BadRequestError } from "@/core/errors/bad-request.error";
import { ForbiddenError } from "@/core/errors/forbidden.error";
import { HTTPError } from "@/core/errors/http.error";
import { InternalServerError } from "@/core/errors/internal-server.error";
import type { AuthService } from "@/core/services/auth.service";

@injectable()
export class AuthController {
  constructor(
    @inject("AuthService") private authService: AuthService,
  ) { }

  async register(request: FastifyRequest, reply: FastifyReply) {
    const { name, email, password } = request.body as {name: string, email: string, password: string};

    if (!name || !email || !password) {
      throw new BadRequestError({
        reason: "Nome, email e senha são obrigatórios.",
        cause: "Requisição inválida",
      });
    }

    try {
      const result = await this.authService.register({
        name,
        email,
        password
      });

      return reply.status(201).send(result);
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

  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as { email: string, password: string };
    if (!email || !password) {
      throw new BadRequestError({
        reason: "Email e senha são obrigatórios.",
        cause: "Email e senha estão ausentes na requisição.",
      });
    }
    try {
      const result = await this.authService.login(email, password);
      return reply.status(200).send(result);
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

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = request.body as { refreshToken: string };

    if (!refreshToken) {
      throw new ForbiddenError({
        reason: "Refresh token ausente ou inválido.",
        cause: "Refresh token ausente ou inválido.",
      });
    }

    try {
      const result = await this.authService.refresh(refreshToken);
      return reply.status(200).send(result);
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

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = request.body as { refreshToken: string };

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    return reply.status(204).send();
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = await this.authService.getProfile(request.userId);
      return reply.status(200).send(user);
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

  async updateMe(request: FastifyRequest, reply: FastifyReply) {
    const { name, email } = request.body as Partial<{ name: string, email: string }>;

    try {
      const user = await this.authService.updateProfile(request.userId, {
        name,
        email,
      });

      return reply.status(200).send(user);
    } catch (err: unknown) {
      if (err instanceof HTTPError) {
        throw err;
      }

      throw new InternalServerError({
        reason: "Erro interno no servidor.",
        cause: err,
      })
    }
  }
}
