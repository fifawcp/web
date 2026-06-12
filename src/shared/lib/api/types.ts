export type ApiResponse<T = void> = {
  success: boolean;
  data?: T;
  pagination?: Pagination;
  error?: ApiError;
  status?: number;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
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
};
