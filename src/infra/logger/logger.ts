import { injectable } from "tsyringe";
import { LoggerInstance } from "./logger-instance";

@injectable()
export class Logger {
  create(requestId: string, context = "APP") {
    return new LoggerInstance(requestId, context);
  }
}
