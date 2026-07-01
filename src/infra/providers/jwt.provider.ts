import jwt, {
  type JwtPayload,
  type SignOptions,
} from "jsonwebtoken";
import { inject, injectable } from "tsyringe";
import type { env as ENV_CONFIG } from "@/configs/env.config";
import { ForbiddenError } from "@/core/errors/forbidden.error";
import { InternalServerError } from "@/core/errors/internal-server.error";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import { errorHelper } from "@/shared/helpers/errors.helper";

@injectable()
export class JWTProvider {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(@inject("Env") private env: typeof ENV_CONFIG) {
    this.secret = this.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES_IN ?? "15m";

    if (!this.secret) {
      throw new Error("JWT_SECRET not configured");
    }
  }

  sign(payload: object): string {
    const options: SignOptions = {
      expiresIn: this.expiresIn as SignOptions["expiresIn"],
    };

    return jwt.sign(payload, this.secret, options);
  }

  verify<T = JwtPayload>(token: string): T {
    const [err, result] = errorHelper(
      () => jwt.verify(token, this.secret) as T,
    );

    if (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new ForbiddenError({
          reason: "Expired token.",
          cause: err,
        });
      }

      if (err instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError({
          reason: "User not authorized.",
          cause: err,
        });
      }

      throw new InternalServerError({
        reason: "Unexpected JWT error.",
        cause: err instanceof Error ? err : undefined,
      });
    }

    return result as T;
  }
}
