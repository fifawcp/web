"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";

import { exchangeToken } from "@/features/auth/api/client";
import { profileSchema, type ProfileFormData } from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useRouter } from "@/i18n/navigation";
import { useApiError } from "@/shared/hooks/useApiError";

export function useRegisterProfileStep() {
  const router = useRouter();
  const apiError = useApiError();
  const { identifier, otp, callbackUrl, setProfile, setCallbackUrl } = useAuthStore();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: "", firstName: "", lastName: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    apiError.clear();

    setProfile(data);

    const res = await exchangeToken({
      identifier,
      otp,
      purpose: "registration",
      user: {
        email: identifier,
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
      },
    });

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

    // Re-render Server Components so the Header (server-rendered, in the shared
    // layout a soft navigation won't re-render) reflects the new session —
    // otherwise it stays on its logged-out render (no avatar). See issue #61.
    router.refresh();
    // Navigate, then clear only the callback. A full reset() would wipe the fields
    // the profile StepGuard requires, tripping it into a redirect that overrides this one.
    router.replace(callbackUrl);
    setCallbackUrl("/");
  });

  const handleBack = () => {
    router.replace("?step=otp");
  };

  return {
    form,
    apiError,
    onSubmit,
    handleBack,
  };
}
