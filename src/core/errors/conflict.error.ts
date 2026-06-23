import status from "http-status";
import type { HTTPErrorInputDetailType } from "@/shared/types/http-error-input-detail.type";
import { HTTPError } from "./http.error";

export class ConflictError extends HTTPError {
  constructor(details: HTTPErrorInputDetailType) {
    super({
      message: "Conflict",
      statusCode: status.CONFLICT,
      details,
    });
  }
}
