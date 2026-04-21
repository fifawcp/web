import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { otpVerifySchema, OtpVerifyFormData } from "../schemas/auth.schema";
import { verifyOtp } from "../api/client";
import { useRegistrationStore } from "../store/registration.store";
import { ApiErrorType } from "@/shared/lib/api/client";
import { logger } from "@/shared/lib/logger";

export function useVerifyOtp() {
  const t = useTranslations();
  const router = useRouter();
  const registrationData = useRegistrationStore((state) => state.registrationData);
  const clearRegistrationData = useRegistrationStore((state) => state.clearRegistrationData);
  const [errorType, setErrorType] = useState<"wrong_code" | "too_many_attempts" | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OtpVerifyFormData>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: OtpVerifyFormData) => {
    setErrorType(null);

    if (!registrationData) {
      logger.error("No registration data found");
      router.push("/login");
      return;
    }

    const response = await verifyOtp({
      identifier: registrationData.email,
      code: data.code,
      purpose: registrationData.purpose,
      username: registrationData.purpose === "registration" ? registrationData.username : undefined,
      first_name: registrationData.purpose === "registration" ? registrationData.first_name : undefined,
      last_name: registrationData.purpose === "registration" ? registrationData.last_name : undefined,
    });

    if (response.success && response.data) {
      const { auth, user } = response.data.data;

      // Backend has verified OTP and returned auth tokens
      // Use NextAuth signIn with special credentials to create session
      const result = await signIn("credentials", {
        email: user.email,
        accessToken: auth.access_token,
        expiresAt: auth.expires_at,
        userData: JSON.stringify(user),
        redirect: false,
      });

      if (result?.ok) {
        clearRegistrationData();
        router.push("/home");
        router.refresh();
      } else {
        logger.error("Failed to create NextAuth session after OTP verification");
        setErrorType("wrong_code");
      }
    } else {
      switch (response.errorType) {
        case ApiErrorType.OTP_INVALID:
        case ApiErrorType.INVALID_CREDENTIALS:
          setErrorType("wrong_code");
          break;
        case ApiErrorType.RATE_LIMIT:
          setErrorType("too_many_attempts");
          break;
        default:
          setErrorType("wrong_code");
      }
      logger.error("Failed to verify OTP:", response.error);
    }
  };

  const getErrorMessage = (field: keyof OtpVerifyFormData) => {
    const error = errors[field];
    return error?.message ? t(error.message) : undefined;
  };

  return {
    register,
    setValue,
    handleSubmit: handleSubmit(onSubmit),
    errors: {
      code: getErrorMessage("code"),
    },
    errorType,
    isLoading: isSubmitting,
  };
}
