import { injectable, inject } from 'tsyringe';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRepository } from '../repositories/UserRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { env } from '../config/env';
import type { UserDTO } from '../entities';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

const DEFAULT_CATEGORIES = [
  { name: 'Salário', icon: '💰', type: 'income' },
  { name: 'Freelance', icon: '💻', type: 'income' },
  { name: 'Investimentos', icon: '📈', type: 'income' },
  { name: 'Outros', icon: '📋', type: 'income' },
  { name: 'Alimentação', icon: '🍔', type: 'expense' },
  { name: 'Transporte', icon: '🚗', type: 'expense' },
  { name: 'Moradia', icon: '🏠', type: 'expense' },
  { name: 'Lazer', icon: '🎮', type: 'expense' },
  { name: 'Saúde', icon: '🏥', type: 'expense' },
  { name: 'Educação', icon: '📚', type: 'expense' },
  { name: 'Compras', icon: '🛒', type: 'expense' },
  { name: 'Outros', icon: '📦', type: 'expense' },
];

@injectable()
export class AuthService {
  constructor(
    @inject('UserRepository') private userRepo: UserRepository,
    @inject('RefreshTokenRepository') private tokenRepo: RefreshTokenRepository,
    @inject('CategoryRepository') private categoryRepo: CategoryRepository,
  ) {}

  private generateAccessToken(userId: string): string {
    return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private toDTO(user: { id: string, name: string, email: string }): UserDTO {
    return { id: user.id, name: user.name, email: user.email };
  }

  async register(name: string, email: string, password: string) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw { statusCode: 409, message: 'Email já cadastrado.' };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepo.create(name, email, passwordHash);

    await this.categoryRepo.createMany(user.id, DEFAULT_CATEGORIES);

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    await this.tokenRepo.create(user.id, refreshToken, expiresAt);

    return { user: this.toDTO(user), accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw { statusCode: 401, message: 'Credenciais inválidas.' };
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw { statusCode: 401, message: 'Credenciais inválidas.' };
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    await this.tokenRepo.create(user.id, refreshToken, expiresAt);

    return { user: this.toDTO(user), accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const stored = await this.tokenRepo.findByToken(refreshToken);
    if (!stored) {
      throw { statusCode: 401, message: 'Refresh token inválido ou expirado.' };
    }

    const user = await this.userRepo.findById(stored.user_id);
    if (!user) {
      throw { statusCode: 401, message: 'Usuário não encontrado.' };
    }

    await this.tokenRepo.deleteByToken(refreshToken);

    const newAccessToken = this.generateAccessToken(user.id);
    const newRefreshToken = this.generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    await this.tokenRepo.create(user.id, newRefreshToken, expiresAt);

    return { user: this.toDTO(user), accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    await this.tokenRepo.deleteByToken(refreshToken);
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'Usuário não encontrado.' };
    }
    return this.toDTO(user);
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    if (data.email) {
      const existing = await this.userRepo.findByEmail(data.email);
      if (existing && existing.id !== userId) {
        throw { statusCode: 409, message: 'Email já está em uso.' };
      }
    }

    const user = await this.userRepo.update(userId, data);
    if (!user) {
      throw { statusCode: 404, message: 'Usuário não encontrado.' };
    }
    return this.toDTO(user);
  }

  verifyAccessToken(token: string): { sub: string } {
    try {
      return jwt.verify(token, env.JWT_SECRET) as { sub: string };
    } catch {
      throw { statusCode: 401, message: 'Token inválido ou expirado.' };
    }
  }
}
