"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { requestOtp, verifyOtpCode } from "@/features/auth/api/client";
import { useCountdown } from "@/features/auth/hooks/useCountdown";
import { otpSchema, type OtpFormData } from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useApiError } from "@/shared/hooks/useApiError";

export function useRegisterOtpStep() {
  const router = useRouter();
  const { identifier, setOtp, reset } = useAuthStore();
  const apiError = useApiError();
  const countdown = useCountdown(30);

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    apiError.clear();

    const res = await verifyOtpCode({ identifier, otp: data.code, purpose: "registration" });
    if (!res.success) {
      apiError.set(res.error);
      return;
    }

    setOtp(data.code);
    router.replace("?step=profile");
  });

  const handleResend = async () => {
    if (countdown.isActive) return;

    await requestOtp({ identifier, purpose: "registration" });
    countdown.reset();
  };

  const handleUseDifferentIdentifier = () => {
    reset();
    router.replace("?step=email");
  };

  return {
    form,
    apiError,
    identifier,
    countdown,
    onSubmit,
    handleResend,
    handleUseDifferentIdentifier,
  };
}
