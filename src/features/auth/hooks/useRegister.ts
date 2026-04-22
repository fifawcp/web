import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerSchema, RegisterFormData } from "../schemas/auth.schema";
import { requestOtp } from "../api/client";
import { OtpPurpose } from "../types/auth.types";
import { useRegistrationStore } from "../store/registration.store";
import { ApiErrorType } from "@/shared/lib/api/types";
import { logger } from "@/shared/lib/logger";

export function useRegister() {
  const t = useTranslations();
  const router = useRouter();
  const setRegistrationData = useRegistrationStore((state) => state.setRegistrationData);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    const response = await requestOtp({ identifier: data.email, purpose: "registration" } as { identifier: string; purpose: OtpPurpose });
    if (response.success) {
      setRegistrationData({
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        purpose: "registration",
      });
      router.push("/verify");
    } else {
      switch (response.errorType) {
        case ApiErrorType.RATE_LIMIT_WAIT:
          setServerError(t("auth.errors.otpCooldown"));
          break;
        case ApiErrorType.RATE_LIMIT:
          setServerError(t("auth.errors.rateLimitExceeded"));
          break;
        case ApiErrorType.VALIDATION_ERROR:
          setServerError(t("auth.errors.validationError"));
          break;
        case ApiErrorType.USER_EXISTS:
        case ApiErrorType.USERNAME_TAKEN:
          setServerError(t("auth.errors.userExists"));
          break;
        case ApiErrorType.NETWORK_ERROR:
          setServerError(t("auth.errors.networkError"));
          break;
        default:
          setServerError(t("auth.errors.unknownError"));
      }
      logger.error("Failed to send OTP:", response.error);
    }
  };

  const getErrorMessage = (field: keyof RegisterFormData) => {
    const error = errors[field];
    return error?.message ? t(error.message) : undefined;
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors: {
      username: getErrorMessage("username"),
      first_name: getErrorMessage("first_name"),
      last_name: getErrorMessage("last_name"),
      email: getErrorMessage("email"),
      acceptTerms: getErrorMessage("acceptTerms"),
    },
    serverError,
    isLoading: isSubmitting,
  };
}
