import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { otpVerifySchema, OtpVerifyFormData } from "../schemas/auth.schema";
import { verifyOtp } from "../api/client";
import { useRegistrationStore } from "../store/registration.store";
import { useAuthStore } from "../store/auth.store";

export function useVerifyOtp() {
  const t = useTranslations();
  const router = useRouter();
  const registrationData = useRegistrationStore((state) => state.registrationData);
  const clearRegistrationData = useRegistrationStore((state) => state.clearRegistrationData);
  const setAuth = useAuthStore((state) => state.setAuth);
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
      console.error("No registration data found");
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
      setAuth(auth.access_token, auth.expires_at, user);
      clearRegistrationData();
      router.push("/home");
    } else {
      if (response.error === "wrong_code" || response.error === "otp is invalid or expired, try again") {
        setErrorType("wrong_code");
      } else if (response.error === "too_many_attempts" || response.error === "too many attempts, try again later") {
        setErrorType("too_many_attempts");
      }
      console.error("Failed to verify OTP:", response.error);
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
