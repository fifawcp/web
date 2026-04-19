import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterFormData } from "../schemas/auth.schema";
import { requestOtp } from "../api/client";
import { OtpPurpose } from "../types/auth.types";
import { useRegistrationStore } from "../store/registration.store";

export function useRegister() {
  const t = useTranslations();
  const router = useRouter();
  const setRegistrationData = useRegistrationStore((state) => state.setRegistrationData);
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
      console.error("Failed to send OTP:", response.error);
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
    isLoading: isSubmitting,
  };
}
