import type { HTTPErrorInputDetailType } from "./http-error-input-detail.type";

export type HTTPErrorInputType = {
  statusCode: number;
  message: string;
  details: HTTPErrorInputDetailType;
};
