import { AsyncLocalStorage } from 'node:async_hooks';
import { container } from 'tsyringe';
import { LoggerPlugin } from '@/http/plugins/logger.plugin';
import { DatabaseConnection } from '@/infra/database';
import { Logger } from '@/infra/logger/logger';
import type { RequestStore } from '@/shared/types/request-store.type';
import { env } from './env.config';
import { RequestContext } from '@/infra/contexts/request.context';

container.registerInstance("Env", { useValue: env });
container.registerSingleton("Database", DatabaseConnection);
container.registerSingleton("Logger", Logger);
container.registerInstance("AsyncLocalStorage", new AsyncLocalStorage<RequestStore>());
container.registerSingleton("RequestContext", RequestContext);
container.registerSingleton("LoggerPlugin", LoggerPlugin);

export { container };
