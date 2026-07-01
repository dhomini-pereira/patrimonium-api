import type { LogEntry } from "@/shared/types/log-entry.type";
import type { LogLevel } from "@/shared/types/log-level.type";

export class LoggerInstance {
  private readonly logs: LogEntry[] = [];

  constructor(
    private readonly requestId: string,
    private readonly context: string,
  ) {}

  child(context: string) {
    return new LoggerInstance(this.requestId, context);
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    this.write("debug", message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.write("info", message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.write("warn", message, metadata);
  }

  error(message: string, metadata?: unknown) {
    this.write("error", message, metadata);
  }

  private write(
    level: LogLevel,
    message: string,
    metadata?: unknown,
  ) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      metadata,
    });
  }

  flush(metadata?: Record<string, unknown>) {
    console.log(
      JSON.stringify(
        {
          requestId: this.requestId,
          ...metadata,
          logs: this.logs,
        },
        null,
        2,
      ),
    );
  }
}
