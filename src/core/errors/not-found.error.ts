import { status } from "http-status";
import type { HTTPErrorInputDetailType } from "@/shared/types/http-error-input-detail.type";
import { HTTPError } from "./http.error";

export class NotFoundError extends HTTPError {
  constructor(details: HTTPErrorInputDetailType) {
    super({
      message: "Not Found",
      statusCode: status.NOT_FOUND,
      details,
    });
  }
}
