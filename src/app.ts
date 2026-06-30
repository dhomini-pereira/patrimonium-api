import type { FastifyInstance } from "fastify";
import "./configs/auto-start.config";
import { container } from "./configs/container.config";

export const app = container.resolve<FastifyInstance>("Server");
