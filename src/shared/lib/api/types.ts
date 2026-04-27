export type ApiResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: ApiError;
};

export type ApiError = {
  code: string;
  message: string;
  requestId: string;
  fields?: Record<string, ApiErrorField>;
};

export type ApiErrorField = {
  code: string;
  message: string;
  params: Record<string, unknown>;
}