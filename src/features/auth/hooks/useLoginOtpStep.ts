"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";

import { exchangeToken, requestOtp } from "@/features/auth/api/client";
import { useCountdown } from "@/features/auth/hooks/useCountdown";
import { otpSchema, type OtpFormData } from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useRouter } from "@/i18n/navigation";
import { useApiError } from "@/shared/hooks/useApiError";

export function useLoginOtpStep() {
  const router = useRouter();
  const { identifier, callbackUrl, setCallbackUrl, reset } = useAuthStore();
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

    const {
      auth: { access_token, expires_at },
      user,
    } = res.data!;

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

    // Re-render Server Components so the Header (which reads the session
    // server-side and lives in the shared layout a soft navigation won't
    // re-render) reflects the just-established session — otherwise it stays on
    // its logged-out render (no avatar). See issue #61.
    router.refresh();
    // Navigate, then clear only the callback. A full reset() would wipe `identifier`
    // mid-step, tripping the OTP StepGuard into a redirect that overrides this navigation.
    router.replace(callbackUrl);
    setCallbackUrl("/");
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
