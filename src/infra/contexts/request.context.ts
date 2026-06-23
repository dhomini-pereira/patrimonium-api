import type { AsyncLocalStorage } from "node:async_hooks";
import { inject, injectable } from "tsyringe";
import type { RequestStore } from "@/shared/types/request-store.type";

@injectable()
export class RequestContext {
  constructor(
    @inject("AsyncLocalStorage") private readonly asyncLocalStorage: AsyncLocalStorage<RequestStore>,
  ) {}

  run<T>(store: RequestStore, callback: () => T): T {
    return this.asyncLocalStorage.run(store, callback);
  }

  getStore() {
    return this.asyncLocalStorage.getStore();
  }

  getRequestId() {
    return this.getStore()?.requestId;
  }

  getLogger() {
    return this.getStore()?.logger;
  }
}
