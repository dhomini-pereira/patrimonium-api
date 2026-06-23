import type { HTTPErrorInputType } from "@/shared/types/http-error-input.type";

export class HTTPError extends Error {
  public statusCode: number;
  constructor({ statusCode, details, message }: HTTPErrorInputType) {
    super(message, { cause: details });
    this.statusCode = statusCode;
  }
}
