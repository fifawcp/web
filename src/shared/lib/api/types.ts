export enum ApiErrorType {
  RATE_LIMIT = "RATE_LIMIT", // 429
  RATE_LIMIT_WAIT = "RATE_LIMIT_WAIT", // 429 with "wait" in message
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

type ErrorResolver = (message?: string) => ApiErrorType;

const errorResolvers: Record<number, ErrorResolver> = {
  400: () => ApiErrorType.VALIDATION_ERROR,

  401: (msg) => (msg?.toLowerCase().includes("otp") ? ApiErrorType.OTP_INVALID : ApiErrorType.INVALID_CREDENTIALS),

  403: () => ApiErrorType.FORBIDDEN,

  404: () => ApiErrorType.NOT_FOUND,

  409: (msg) => {
    const lowerMsg = msg?.toLowerCase() || "";
    return lowerMsg.includes("username") || lowerMsg.includes("taken") ? ApiErrorType.USERNAME_TAKEN : ApiErrorType.USER_EXISTS;
  },

  429: (msg) => {
    const lowerMsg = msg?.toLowerCase() || "";
    return lowerMsg.includes("wait") ? ApiErrorType.RATE_LIMIT_WAIT : ApiErrorType.RATE_LIMIT;
  },

  500: () => ApiErrorType.SERVER_ERROR,
  502: () => ApiErrorType.SERVER_ERROR,
  503: () => ApiErrorType.SERVER_ERROR,
  504: () => ApiErrorType.SERVER_ERROR,
};

export function getErrorType(statusCode: number, errorMessage?: string): ApiErrorType {
  const resolver = errorResolvers[statusCode];
  if (!resolver) {
    return ApiErrorType.UNKNOWN_ERROR;
  }
  const result = resolver(errorMessage);
  return result;
}
