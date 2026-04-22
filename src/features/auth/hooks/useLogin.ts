import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginSchema, LoginFormData } from "../schemas/auth.schema";
import { requestOtp } from "../api/client";
import { useRegistrationStore } from "../store/registration.store";
import { ApiErrorType } from "@/shared/lib/api/types";
import { logger } from "@/shared/lib/logger";

export function useLogin() {
  const t = useTranslations();
  const router = useRouter();
  const { setRegistrationData } = useRegistrationStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    const response = await requestOtp({ identifier: data.email, purpose: "login" });

    if (!response.success) {
      switch (response.errorType) {
        case ApiErrorType.RATE_LIMIT_WAIT:
          setServerError(t("auth.errors.otpCooldown"));
          break;
        case ApiErrorType.RATE_LIMIT:
          setServerError(t("auth.errors.rateLimitExceeded"));
          break;
        case ApiErrorType.INVALID_CREDENTIALS:
        case ApiErrorType.UNAUTHORIZED:
          setServerError(t("auth.errors.invalidCredentials"));
          break;
        case ApiErrorType.SERVER_ERROR:
          setServerError(t("auth.errors.serverError"));
          break;
        case ApiErrorType.NETWORK_ERROR:
          setServerError(t("auth.errors.networkError"));
          break;
        default:
          setServerError(t("auth.errors.unknownError"));
      }
      logger.error("Failed to send OTP:", response.error);
      return;
    }

    setRegistrationData({
      email: data.email,
      username: "",
      first_name: "",
      last_name: "",
      purpose: "login",
    });
    router.push("/verify");
  };

  const getErrorMessage = (field: keyof LoginFormData) => {
    const error = errors[field];
    return error?.message ? t(error.message) : undefined;
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors: {
      email: getErrorMessage("email"),
    },
    serverError,
    isLoading: isSubmitting,
  };
}
