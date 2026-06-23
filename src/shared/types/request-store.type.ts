import type { LoggerInstance } from "@/infra/logger/logger-instance";

export interface RequestStore {
  requestId: string;
  logger: LoggerInstance;
}
