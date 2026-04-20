export enum ApiErrorType {
  RATE_LIMIT = "RATE_LIMIT", // 429
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS", // 401
  OTP_INVALID = "OTP_INVALID", // 401
  USER_EXISTS = "USER_EXISTS", // 409
  USERNAME_TAKEN = "USERNAME_TAKEN", // 409
  VALIDATION_ERROR = "VALIDATION_ERROR", // 400
  UNAUTHORIZED = "UNAUTHORIZED", // 401
  FORBIDDEN = "FORBIDDEN", // 403
  NOT_FOUND = "NOT_FOUND", // 404
  SERVER_ERROR = "SERVER_ERROR", // 500
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  errorType?: ApiErrorType;
  statusCode?: number;
};

// Map HTTP status codes to error types based on context
export function getErrorType(statusCode: number, errorMessage?: string): ApiErrorType {
  switch (statusCode) {
    case 400:
      return ApiErrorType.VALIDATION_ERROR;
    case 401:
      if (errorMessage?.toLowerCase().includes("otp")) {
        return ApiErrorType.OTP_INVALID;
      }
      return ApiErrorType.INVALID_CREDENTIALS;
    case 403:
      return ApiErrorType.FORBIDDEN;
    case 404:
      return ApiErrorType.NOT_FOUND;
    case 409:
      if (errorMessage?.toLowerCase().includes("username")) {
        return ApiErrorType.USERNAME_TAKEN;
      }

      return ApiErrorType.USER_EXISTS;
    case 429:
      return ApiErrorType.RATE_LIMIT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ApiErrorType.SERVER_ERROR;
    default:
      return ApiErrorType.UNKNOWN_ERROR;
  }
}
