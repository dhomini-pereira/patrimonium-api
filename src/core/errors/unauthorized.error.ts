import { status } from "http-status";
import type { HTTPErrorInputDetailType } from "@/shared/types/http-error-input-detail.type";
import { HTTPError } from "./http.error";

export class UnauthorizedError extends HTTPError {
  constructor(details: HTTPErrorInputDetailType) {
    super({
      message: "Unauthorized",
      statusCode: status.UNAUTHORIZED,
      details,
    });
  }
}
