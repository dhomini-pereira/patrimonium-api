import './configs/auto-start.config';
import { fastify } from "fastify";
import { container } from './configs/container.config';
import type { LoggerPlugin } from './http/plugins/logger.plugin';

export const app = fastify();

const loggerPlugin = container.resolve<LoggerPlugin>("LoggerPlugin");

app.addHook('onRequest', loggerPlugin.onRequest);
app.addHook('onResponse', loggerPlugin.onResponse);

app.get("/health", (_req, reply) => {
  return reply.status(200).send({
    uptime: Date.now(),
    status: "OK",
  })
});
