import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { inject, injectable } from "tsyringe";
import type { JWTProvider } from "../../infra/providers/jwt.provider";
import { ConflictError } from '../errors/conflict.error';
import { ForbiddenError } from '../errors/forbidden.error';
import { NotFoundError } from '../errors/not-found.error';
import { UnauthorizedError } from '../errors/unauthorized.error';
import type { CategoryRepository } from "../repositories/category.repo";
import type { RefreshTokenRepository } from "../repositories/refresh-token.repo";
import type { UserRepository } from "../repositories/user.repo";

const REFRESH_TOKEN_EXPIRY_DAYS = 30;

const DEFAULT_CATEGORIES: {name: string, icon: string, type: "income" | "expense"}[] = [
  { name: "Salário", icon: "💰", type: "income" },
  { name: "Freelance", icon: "💻", type: "income" },
  { name: "Investimentos", icon: "📈", type: "income" },
  { name: "Outros", icon: "📋", type: "income" },
  { name: "Alimentação", icon: "🍔", type: "expense" },
  { name: "Transporte", icon: "🚗", type: "expense" },
  { name: "Moradia", icon: "🏠", type: "expense" },
  { name: "Lazer", icon: "🎮", type: "expense" },
  { name: "Saúde", icon: "🏥", type: "expense" },
  { name: "Educação", icon: "📚", type: "expense" },
  { name: "Compras", icon: "🛒", type: "expense" },
  { name: "Outros", icon: "📦", type: "expense" },
];

@injectable()
export class AuthService {
  constructor(
    @inject("UserRepository") private userRepository: UserRepository,
    @inject("RefreshTokenRepository") private refreshTokenRepository: RefreshTokenRepository,
    @inject("CategoryRepository") private categoryRepository: CategoryRepository,
    @inject("JWTProvider") private jwtProvider: JWTProvider,
  ) { }

  private generateAccessToken(userId: string) {
    return this.jwtProvider.sign({ sub: userId })
  }

  private generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
  }

  async register(data: { name: string, email: string, password: string }) {
    const existing = await this.userRepository.findByEmail(data.email);

    if (existing) {
      throw new ConflictError({
        reason: "Email já cadastrado.",
        cause: "Email já cadastrado."
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.userRepository.create({ ...data, passwordHash });

    await this.categoryRepository.createMany(user.id, DEFAULT_CATEGORIES);

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken();

    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.refreshTokenRepository.create({
      expiresAt,
      token: refreshToken,
      userId: user.id,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError({
        reason: "Credenciais inválidas.",
        cause: "Credenciais inválidas.",
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedError({
        reason: "Credenciais inválidas.",
        cause: "Credenciais inválidas.",
      });
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken();

    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.refreshTokenRepository.create({
      expiresAt,
      token: refreshToken,
      userId: user.id,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    }
  }

  async refresh(refreshToken: string) {
    const stored = await this.refreshTokenRepository.findByToken(refreshToken);

    if (!stored) {
      throw new ForbiddenError({
        reason: "Refresh token inválido ou expirado.",
        cause: "Refresh token inválido ou expirado.",
      });
    }

    const user = await this.userRepository.findById(stored.userId);

    if (!user) {
      throw new ForbiddenError({
        reason: "Usuário não encontrado.",
        cause: "Usuário não encontrado.",
      });
    }

    await this.refreshTokenRepository.deleteByToken(refreshToken);

    const newAccessToken = this.generateAccessToken(user.id);
    const newRefreshToken = this.generateRefreshToken();
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  }

  async logout(refreshToken: string) {
    await this.refreshTokenRepository.deleteByToken(refreshToken);
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError({
        reason: "Usuário não encontrado.",
        cause: "Usuário não encontrado.",
      });
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }
  }

  async updateProfile(userId: string, data: Partial<{ name: string, email: string }>) {
    if (data.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing && existing.id !== userId) {
        throw new ConflictError({
          reason: "Email já está em uso.",
          cause: "Email já está em uso.",
        });
      }
    }

    const user = await this.userRepository.update(userId, data);

    if (!user) {
      throw new NotFoundError({
        reason: "Usuário não encontrado.",
        cause: "Usuário não encontrado."
      });
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }
  }

  verifyAccessToken(token: string) {
    try {
      return this.jwtProvider.verify(token);
    } catch (err: unknown) {
      throw new UnauthorizedError({
        reason: "Token inválido ou expirado",
        cause: err,
      });
    }
  }
}
