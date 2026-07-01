import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import { inject, injectable } from "tsyringe";

@injectable()
export class SwaggerPlugin {
  constructor(
    @inject("Server") private server: FastifyInstance
  ) { }
  registerPlugin() {
    this.server.register(fastifySwagger, {
      swagger: {
        info: {
          title: "Patrimonium API",
          description: "API para o sistema de patrimônio.",
          version: "1.0.0",
        },
      },
    });

    this.server.register(fastifySwaggerUi, {
      routePrefix: "/docs",
    });
  }
}
