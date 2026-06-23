import { status } from "http-status";
import type { HTTPErrorInputDetailType } from "@/shared/types/http-error-input-detail.type";
import { HTTPError } from "./http.error";

export class InternalServerError extends HTTPError {
  constructor(details: HTTPErrorInputDetailType) {
    super({
      message: "Internal Server Error",
      statusCode: status.INTERNAL_SERVER_ERROR,
      details,
    });
  }
}
