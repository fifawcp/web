"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { exchangeToken, requestOtp } from "@/features/auth/api/client";
import { useCountdown } from "@/features/auth/hooks/useCountdown";
import { otpSchema, type OtpFormData } from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useApiError } from "@/shared/hooks/useApiError";

export function useLoginOtpStep() {
  const router = useRouter();
  const { identifier, reset } = useAuthStore();
  const countdown = useCountdown(30);
  const apiError = useApiError();

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    apiError.clear();

    const res = await exchangeToken({ identifier, otp: data.code, purpose: "login" });
    if (!res.success) {
      apiError.set(res.error);
      return;
    }

    const { access_token, expires_at, user } = res.data!;
    
    const result = await signIn("credentials", {
      access_token,
      expires_at,
      user: JSON.stringify(user),
      redirect: false,
    });

    if (!result?.ok) {
      apiError.set(undefined);
      return;
    }

    reset();
    router.replace("/home");
  });

  const handleResend = async () => {
    if (countdown.isActive) return;

    await requestOtp({ identifier, purpose: "login" });
    countdown.reset();
  };

  const handleUseDifferentIdentifier = () => {
    reset();
    router.replace("?step=identifier");
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
