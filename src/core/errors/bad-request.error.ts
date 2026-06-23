import { status } from "http-status";
import type { HTTPErrorInputDetailType } from "@/shared/types/http-error-input-detail.type";
import { HTTPError } from "./http.error";

export class BadRequestError extends HTTPError {
  constructor(details: HTTPErrorInputDetailType) {
    super({
      message: "Bad Request",
      statusCode: status.BAD_REQUEST,
      details,
    });
  }
}
