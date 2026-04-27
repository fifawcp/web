"use client";

import { useEffect } from "react";
import { Mail, MoveLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import { AuthActionLink } from "@/features/auth/components/AuthActionLink";
import { AuthStepHeaderIcon } from "@/features/auth/components/AuthStepHeaderIcon";
import { ErrorAlert } from "@/features/auth/components/ErrorAlert";
import { FieldMessageSlot } from "@/features/auth/components/FieldMessageSlot";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { OtpDevTotpFill } from "@/features/auth/components/OtpDevTotpFill";
import { StepGuard } from "@/features/auth/components/StepGuard";
import { StepIndicator } from "@/features/auth/components/StepIndicator";
import { useLoginIdentifierStep } from "@/features/auth/hooks/useLoginIdentifierStep";
import { useLoginOtpStep } from "@/features/auth/hooks/useLoginOtpStep";
import { formatCountdown } from "@/features/auth/utils";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/ui/input-otp";
import { Separator } from "@/shared/components/ui/separator";

type LoginStep = "identifier" | "otp";

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

  const pageContent = <LoginPageShell stepIndex={stepIndex}>{step === "otp" ? <OtpStep /> : <IdentifierStep />}</LoginPageShell>;

  if (step === "otp") {
    return <StepGuard requiredFields={["identifier"]}>{pageContent}</StepGuard>;
  }

  return pageContent;
}

function LoginPageShell({ stepIndex, children }: { stepIndex: number; children: React.ReactNode }) {
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
  const { form, apiError, onSubmit } = useLoginIdentifierStep();

  return (
    <>
      <CardHeader className="space-y-1 text-center">
        <AuthStepHeaderIcon icon={Mail} />
        <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
        <CardDescription>{t("login.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ErrorAlert message={apiError.message} />
        <form id="login-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="identifier"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-form-identifier">{t("login.identifier")}</FieldLabel>
                  <Input
                    {...field}
                    id="login-form-identifier"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("login.identifierPlaceholder")}
                    autoComplete="email"
                    onBlur={field.onBlur}
                  />
                  <FieldMessageSlot>
                    {fieldState.invalid && fieldState.error?.message ? <FieldError errors={[{ message: t(fieldState.error.message) }]} /> : null}
                  </FieldMessageSlot>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <Button type="submit" form="login-form" className="w-full" disabled={form.formState.isSubmitting}>
          Continue
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-6">
        <div className="flex w-full flex-row items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("login.orContinueWithEmail")}</span>
          <Separator className="flex-1" />
        </div>
        <GoogleButton label={t("login.googleSignIn")} />
      </CardFooter>
    </>
  );
}

function OtpStep() {
  const t = useTranslations("auth");
  const { form, apiError, identifier, countdown, onSubmit, handleResend, handleUseDifferentIdentifier } = useLoginOtpStep();
  const otpValue = form.watch("code");

  return (
    <>
      <CardHeader className="relative space-y-1 text-center">
        <OtpDevTotpFill
          identifier={identifier}
          setOtpCode={(code) => form.setValue("code", code, { shouldDirty: true, shouldValidate: true })}
          onApiError={(err) => apiError.set(err ?? undefined)}
        />
        <AuthStepHeaderIcon icon={ShieldCheck} />
        <CardTitle className="text-2xl">{t("otp.title")}</CardTitle>
        <CardDescription className="text-center">
          <span className="block">{t("otp.subtitle").trimEnd()}</span>
          <span className="block font-semibold text-foreground">{identifier}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ErrorAlert message={apiError.message} />
        <form id="otp-form" onSubmit={onSubmit}>
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
                        void onSubmit();
                      }}
                    >
                      <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-14 *:data-[slot=input-otp-slot]:w-13 *:data-[slot=input-otp-slot]:text-xl">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <FieldMessageSlot>
                    {fieldState.invalid && fieldState.error?.message ? <FieldError errors={[{ message: t(fieldState.error.message) }]} /> : null}
                  </FieldMessageSlot>
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <Button type="submit" form="otp-form" className="w-full" disabled={form.formState.isSubmitting || otpValue.length !== 6}>
          {t("otp.verifyCode")}
        </Button>

        <div className="flex flex-col items-center gap-1 text-center text-sm text-muted-foreground">
          <span>{t("otp.resend")}</span>
          <AuthActionLink
            label={countdown.isActive ? t("otp.resendIn", { time: formatCountdown(countdown.seconds) }) : t("otp.resendCode")}
            onClick={handleResend}
            disabled={countdown.isActive}
            className="h-auto disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex w-full flex-row items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("otp.or")}</span>
          <Separator className="flex-1" />
        </div>

        <div className="text-center">
          <AuthActionLink href="/login?step=identifier" onClick={handleUseDifferentIdentifier} icon={MoveLeft} label={t("otp.useDifferentEmail")} />
        </div>
      </CardContent>
    </>
  );
}
