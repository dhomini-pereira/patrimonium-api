import type { FastifyRequest as FastifyRequestOrigin } from "fastify";

declare module "fastify" {
  interface FastifyRequest extends FastifyRequestOrigin {
    userId: string;
  }
}
