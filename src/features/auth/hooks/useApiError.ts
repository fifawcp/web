import { useTranslations } from "next-intl";
import { ApiErrorType } from "@/shared/lib/api/types";

/**
 * Maps API error types to i18n translation keys
 * Centralized error handling to avoid repetitive switch statements
 */
const ERROR_TYPE_TO_I18N_KEY: Record<ApiErrorType, string> = {
  [ApiErrorType.RATE_LIMIT_WAIT]: "auth.errors.otpCooldown",
  [ApiErrorType.RATE_LIMIT]: "auth.errors.rateLimitExceeded",
  [ApiErrorType.INVALID_CREDENTIALS]: "auth.errors.invalidCredentials",
  [ApiErrorType.OTP_INVALID]: "auth.errors.otpInvalid",
  [ApiErrorType.USER_EXISTS]: "auth.errors.userExists",
  [ApiErrorType.USERNAME_TAKEN]: "auth.errors.userExists",
  [ApiErrorType.VALIDATION_ERROR]: "auth.errors.validationError",
  [ApiErrorType.UNAUTHORIZED]: "auth.errors.invalidCredentials",
  [ApiErrorType.FORBIDDEN]: "auth.errors.forbidden",
  [ApiErrorType.NOT_FOUND]: "auth.errors.notFound",
  [ApiErrorType.SERVER_ERROR]: "auth.errors.serverError",
  [ApiErrorType.NETWORK_ERROR]: "auth.errors.networkError",
  [ApiErrorType.UNKNOWN_ERROR]: "auth.errors.unknownError",
};

/**
 * Custom hook for handling API errors with i18n
 * Returns a function that translates ApiErrorType to localized error message
 * 
 * @example
 * const handleApiError = useApiError();
 * const errorMessage = handleApiError(response.errorType);
 * setServerError(errorMessage);
 */
export function useApiError() {
  const t = useTranslations();

  /**
   * Translates an API error type to a localized error message
   * @param errorType - The API error type from the response
   * @returns Translated error message
   */
  const handleApiError = (errorType?: ApiErrorType): string => {
    if (!errorType) {
      return t("auth.errors.unknownError");
    }

    const i18nKey = ERROR_TYPE_TO_I18N_KEY[errorType];
    return t(i18nKey || "auth.errors.unknownError");
  };

  return handleApiError;
}
