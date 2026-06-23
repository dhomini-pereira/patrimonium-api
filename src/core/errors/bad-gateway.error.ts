import status from "http-status";
import type { HTTPErrorInputDetailType } from "@/shared/types/http-error-input-detail.type";
import { HTTPError } from "./http.error";

export class BadGatewayError extends HTTPError {
  constructor(details: HTTPErrorInputDetailType) {
    super({
      message: "Bad Gateway",
      statusCode: status.BAD_GATEWAY,
      details,
    });
  }
}
