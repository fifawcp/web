"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";

import { exchangeToken } from "@/features/auth/api/client";
import { profileSchema, type ProfileFormData } from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useApiError } from "@/shared/hooks/useApiError";

export function useRegisterProfileStep() {
  const router = useRouter();
  const apiError = useApiError();
  const { identifier, otp, setProfile, reset } = useAuthStore();

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

    reset();
    router.replace("/");
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
