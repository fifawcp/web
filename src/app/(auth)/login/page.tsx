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
import { requestOtp, exchangeToken } from "@/features/auth/api/client";
import { useCountdown } from "@/features/auth/hooks/useCountdown";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useApiError } from "@/shared/hooks/useApiError";
import { loginIdentifierSchema, otpSchema, type LoginIdentifierFormData, type OtpFormData } from "@/features/auth/schemas/auth.schema";
import { Mail, MoveLeft, ShieldCheck } from "lucide-react";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { FieldMessageSlot } from "@/features/auth/components/FieldMessageSlot";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stepParam = searchParams.get("step");
  const step: LoginStep = stepParam === "otp" || stepParam === "identifier" ? stepParam : "identifier";
  const stepIndex = step === "otp" ? 1 : 0;

  useEffect(() => {
    if (stepParam === null || step === stepParam) return;
    router.replace(`?step=${step}`);
  }, [router, step, stepParam]);

  const pageContent = (
    <LoginPageShell stepIndex={stepIndex}>
      {step === "otp" ? <OtpStep /> : <IdentifierStep />}
    </LoginPageShell>
  );

  if (step === "otp") {
    return <StepGuard requiredFields={["identifier"]}>{pageContent}</StepGuard>;
  }

  return pageContent;
}

type LoginStep = "identifier" | "otp";

function LoginPageShell({
  stepIndex,
  children,
}: {
  stepIndex: number;
  children: React.ReactNode;
}) {
  const t = useTranslations("auth.login");

  return (
    <div className="mx-auto w-full max-w-md">
      <StepIndicator steps={["step_identifier", "step_verify"].map((s) => t(s))} currentStep={stepIndex} />
      <Card className="bg-card">{children}</Card>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-medium text-foreground hover:underline">
          {t("createOne")}
        </Link>
      </p>
    </div>
  );
}

function IdentifierStep() {
  const t = useTranslations("auth");
  const router = useRouter();
  const apiError = useApiError();
  const { setIdentifier } = useAuthStore();

  const form = useForm<LoginIdentifierFormData>({
    resolver: zodResolver(loginIdentifierSchema),
    defaultValues: { identifier: "" },
  });

  const onSubmit = async (data: LoginIdentifierFormData) => {
    apiError.clear();

    const res = await requestOtp({ identifier: data.identifier, purpose: "login" });
    if (!res.success) {
      apiError.set(res.error);
      return;
    }

    setIdentifier({ identifier: data.identifier, purpose: "login" });
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
        <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
        <CardDescription>{t("login.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiError.message && <ErrorAlert message={apiError.message} />}
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="identifier"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`login-form-identifier`}>
                    {t("login.identifier")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="login-form-identifier"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("login.identifierPlaceholder")}
                    autoComplete="email"
                    onBlur={field.onBlur}
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
        </form>
        <Button
          type="submit"
          form="login-form"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          Continue
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-6">
        <div className="flex flex-row items-center gap-2 w-full">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("login.orContinueWithEmail")}</span>
          <Separator className="flex-1" />
        </div>
        <GoogleButton label={t("login.googleSignIn")} />
      </CardFooter>
    </>
  );
}

function OtpStep() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { identifier, reset } = useAuthStore();
  const countdown = useCountdown(30);
  const apiError = useApiError();

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (data: OtpFormData) => {
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
  };

  const handleResend = async () => {
    if (countdown.isActive) return;

    await requestOtp({ identifier, purpose: "login" });
    countdown.reset();
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
        <CardDescription>
          {t("otp.subtitle")} <b className="text-foreground font-semibold">{identifier}</b>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiError.message && <ErrorAlert message={apiError.message} />}
        <form id="otp-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex justify-center">
                    <InputOTP
                      {...field}
                      id="otp-form-code"
                      maxLength={6}
                      aria-invalid={fieldState.invalid}
                      onComplete={() => {
                        void form.handleSubmit(onSubmit)();
                      }}
                    >
                      <InputOTPGroup
                        className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl"
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
            disabled={countdown.isActive}
            className="text-foreground hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {countdown.isActive ? t("otp.resendIn", { seconds: countdown.seconds }) : "Resend code"}
          </button>
        </div>
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              reset();
              router.replace("?step=identifier");
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