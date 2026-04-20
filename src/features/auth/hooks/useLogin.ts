import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginSchema, LoginFormData } from "../schemas/auth.schema";
import { requestOtp } from "../api/client";
import { OtpPurpose } from "../types/auth.types";
import { useRegistrationStore } from "../store/registration.store";

export function useLogin() {
  const t = useTranslations();
  const router = useRouter();
  const setRegistrationData = useRegistrationStore((state) => state.setRegistrationData);
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
    const response = await requestOtp({ identifier: data.email, purpose: "login" } as { identifier: string; purpose: OtpPurpose });
    if (response.success) {
      setRegistrationData({
        email: data.email,
        username: "",
        first_name: "",
        last_name: "",
        purpose: "login",
      });
      router.push("/verify");
    } else {
      const errorCode = response.error;
      if (errorCode === "401" || errorCode?.includes("Invalid") || errorCode?.includes("credentials")) {
        setServerError(t("auth.errors.invalidCredentials"));
      } else if (errorCode === "429" || errorCode?.includes("many")) {
        setServerError(t("auth.errors.tooManyAttempts"));
      } else {
        setServerError(t("auth.errors.invalidCredentials"));
      }
      console.error("Failed to send OTP:", response.error);
    }
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
