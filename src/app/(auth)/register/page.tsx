"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/ui/input-otp";
import { Separator } from "@/shared/components/ui/separator";
import { StepIndicator } from "@/features/auth/components/StepIndicator";
import { StepGuard } from "@/features/auth/components/StepGuard";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { ErrorAlert } from "@/features/auth/components/ErrorAlert";
import { requestOtp, verifyOtpCode, exchangeToken } from "@/features/auth/api/client";
import { useCountdown } from "@/features/auth/hooks/useCountdown";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useApiError } from "@/shared/hooks/useApiError";
import {
  registerEmailSchema,
  otpSchema,
  profileSchema,
  type RegisterEmailFormData,
  type OtpFormData,
  type ProfileFormData,
} from "@/features/auth/schemas/auth.schema";
import { Mail, MoveLeft, ShieldCheck, User } from "lucide-react";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { FieldMessageSlot } from "@/features/auth/components/FieldMessageSlot";

type RegisterStep = "email" | "otp" | "profile";

function EmailStep() {
  const t = useTranslations("auth");
  const router = useRouter();
  const apiError = useApiError();
  const { setIdentifier } = useAuthStore();

  const form = useForm<RegisterEmailFormData>({
    resolver: zodResolver(registerEmailSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: RegisterEmailFormData) => {
    apiError.clear();

    const res = await requestOtp({ identifier: data.email, purpose: "registration" });
    if (!res.success) {
      apiError.set(res.error);
      return;
    }

    setIdentifier({ identifier: data.email, purpose: "registration" });
    router.replace("?step=otp");
  };

  return (
    <>
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="p-2 rounded-lg bg-muted">
            <Mail className="w-6 h-6" />
          </div>
        </div>
        <CardTitle className="text-2xl">{t("register.title")}</CardTitle>
        <CardDescription>{t("register.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiError.message && <ErrorAlert message={apiError.message} />}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-email">{t("register.email")}</FieldLabel>
                  <Input
                    {...field}
                    id="register-email"
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("register.emailPlaceholder")}
                    autoComplete="email"
                  />
                  <FieldMessageSlot>
                    {fieldState.invalid && fieldState.error?.message && (
                      <FieldError errors={[{ message: t(fieldState.error.message) }]} />
                    )}
                  </FieldMessageSlot>
                </Field>
              )}
            />
          </FieldGroup>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {t("register.continue")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-6">
        <div className="flex flex-row items-center gap-2 w-full">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("register.orContinueWithEmail")}</span>
          <Separator className="flex-1" />
        </div>
        <GoogleButton label={t("register.googleSignIn")} />
      </CardFooter>
    </>
  );
}

function OtpStep() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { identifier, setOtp, reset } = useAuthStore();
  const apiError = useApiError();
  const { seconds: countdown, isActive, reset: resetCountdown } = useCountdown(30);

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (data: OtpFormData) => {
    apiError.clear();

    const res = await verifyOtpCode({ identifier, otp: data.code, purpose: "registration" });
    if (!res.success) {
      apiError.set(res.error);
      return;
    }

    setOtp(data.code);
    router.replace("?step=profile");
  };

  const handleResend = async () => {
    if (isActive) return;
    await requestOtp({ identifier, purpose: "registration" });
    resetCountdown();
  };

  return (
    <>
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="p-2 rounded-lg bg-muted">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        <CardTitle className="text-2xl">{t("otp.title")}</CardTitle>
        <CardDescription>{t("otp.subtitle")} <b className="text-foreground font-semibold">{identifier}</b></CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiError.message && <ErrorAlert message={apiError.message} />}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex justify-center">
                    <InputOTP
                      {...field}
                      id="register-otp-code"
                      maxLength={6}
                      aria-invalid={fieldState.invalid}
                      onComplete={() => {
                        void form.handleSubmit(onSubmit)();
                      }}
                    >
                      <InputOTPGroup
                        className="*:data-[slot=input-otp-slot]:h-14 *:data-[slot=input-otp-slot]:w-13 *:data-[slot=input-otp-slot]:text-xl"
                      >
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <FieldMessageSlot>
                    {fieldState.invalid && fieldState.error?.message && (
                      <FieldError errors={[{ message: t(fieldState.error.message) }]} />
                    )}
                  </FieldMessageSlot>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>{t("otp.resend")}</p>
          <button
            type="button"
            onClick={handleResend}
            disabled={isActive}
            className="text-foreground hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isActive ? t("otp.resendIn", { seconds: countdown }) : "Resend code"}
          </button>
        </div>
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              reset();
              router.replace("?step=email");
            }}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
          >
            <MoveLeft className="size-4 shrink-0" aria-hidden />
            {t("otp.useDifferentEmail")}
          </button>
        </div>
      </CardContent>
    </>
  );
}

function ProfileStep() {
  const t = useTranslations("auth");
  const router = useRouter();
  const apiError = useApiError();
  const { identifier, otp, setProfile, reset } = useAuthStore();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: "", firstName: "", lastName: "" },
  });

  const onSubmit = async (data: ProfileFormData) => {
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
  };

  return (
    <>
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="p-2 rounded-lg bg-muted">
            <User className="w-6 h-6" />
          </div>
        </div>
        <CardTitle className="text-2xl">{t("profile.title")}</CardTitle>
        <CardDescription>{t("profile.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiError.message && <ErrorAlert message={apiError.message} />}
        <form id="register-profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-first-name">{t("profile.firstName")}</FieldLabel>
                  <Input
                    {...field}
                    id="register-first-name"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("profile.firstNamePlaceholder")}
                    autoComplete="given-name"
                  />
                  <FieldMessageSlot>
                    {fieldState.invalid && fieldState.error?.message && (
                      <FieldError errors={[{ message: t(fieldState.error.message) }]} />
                    )}
                  </FieldMessageSlot>
                </Field>
              )}
            />
            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-last-name">{t("profile.lastName")}</FieldLabel>
                  <Input
                    {...field}
                    id="register-last-name"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("profile.lastNamePlaceholder")}
                    autoComplete="family-name"
                  />
                  <FieldMessageSlot>
                    {fieldState.invalid && fieldState.error?.message && (
                      <FieldError errors={[{ message: t(fieldState.error.message) }]} />
                    )}
                  </FieldMessageSlot>
                </Field>
              )}
            />
          </div>
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="register-username">{t("profile.username")}</FieldLabel>
                <Input
                  {...field}
                  id="register-username"
                  aria-invalid={fieldState.invalid}
                  placeholder={t("profile.usernamePlaceholder")}
                  autoComplete="username"
                />
                <FieldMessageSlot>
                  {fieldState.invalid && fieldState.error?.message && (
                    <FieldError errors={[{ message: t(fieldState.error.message) }]} />
                  )}
                </FieldMessageSlot>
              </Field>
            )}
          />
          
        </form>
      </CardContent>
      <CardFooter>
        <div className="grid w-full grid-cols-12 gap-3">
          <Button
            type="button"
            variant="link"
            className="col-span-4 justify-center gap-2 font-semibold text-foreground no-underline hover:no-underline"
            onClick={() => router.replace("?step=otp")}
          >
            <MoveLeft className="size-5 shrink-0" aria-hidden />
            {t("profile.back")}
          </Button>
          <Button
            type="submit"
            form="register-profile-form"
            className="col-span-8 font-semibold"
            disabled={form.formState.isSubmitting}
          >
            {t("profile.createAccount")}
          </Button>
        </div>
      </CardFooter>
    </>
  );
}

const STEPS = ["step_identifier", "step_verify", "step_profile"] as const;

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const searchParams = useSearchParams();
  const router = useRouter();
  const stepParam = searchParams.get("step");
  const step: RegisterStep =
    stepParam === "email" || stepParam === "otp" || stepParam === "profile" ? stepParam : "email";
  const stepIndex = step === "otp" ? 1 : step === "profile" ? 2 : 0;

  useEffect(() => {
    if (stepParam === null || stepParam === step) return;
    router.replace(`?step=${step}`);
  }, [router, step, stepParam]);

  return (
    <div className="w-full max-w-md mx-auto">
      <StepIndicator steps={STEPS.map((s) => t(s))} currentStep={stepIndex} />
      <Card className="bg-card">
        {step === "email" && <EmailStep />}
        {step === "otp" && (
          <StepGuard requiredFields={["identifier"]}>
            <OtpStep />
          </StepGuard>
        )}
        {step === "profile" && (
          <StepGuard requiredFields={["identifier", "otp"]} redirectTo="?step=otp">
            <ProfileStep />
          </StepGuard>
        )}
      </Card>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
