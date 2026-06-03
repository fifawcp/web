"use client";

import { useEffect } from "react";
import { Mail } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import { AuthOtpStep } from "@/features/auth/components/AuthOtpStepCard";
import { AuthStepHeaderIcon } from "@/features/auth/components/AuthStepHeaderIcon";
import { ErrorAlert } from "@/features/auth/components/ErrorAlert";
import { FieldMessageSlot } from "@/features/auth/components/FieldMessageSlot";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { StepGuard } from "@/features/auth/components/StepGuard";
import { StepIndicator } from "@/features/auth/components/StepIndicator";
import { useLoginIdentifierStep } from "@/features/auth/hooks/useLoginIdentifierStep";
import { useLoginOtpStep } from "@/features/auth/hooks/useLoginOtpStep";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";

type LoginStep = "identifier" | "otp";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const stepParam = searchParams.get("step");
  const step: LoginStep = stepParam === "otp" || stepParam === "identifier" ? stepParam : "identifier";
  const stepIndex = step === "otp" ? 1 : 0;

  // Arrived here because the middleware invalidated an unrecoverable session. It
  // cleared the cookie, but the client SessionProvider still holds the session in
  // memory after a soft nav — sign out to clear the stale navbar, then drop the flag.
  useEffect(() => {
    if (searchParams.get("session") !== "expired") return;
    void signOut({ redirect: false });
    router.replace(pathname);
  }, [searchParams, router, pathname]);

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
          {t("login.continue")}
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
  const otpStep = useLoginOtpStep();

  return (
    <AuthOtpStep
      formId="otp-form"
      otpInputId="otp-form-code"
      differentIdentifierHref="/login?step=identifier"
      form={otpStep.form}
      apiError={otpStep.apiError}
      identifier={otpStep.identifier}
      countdown={otpStep.countdown}
      onSubmit={otpStep.onSubmit}
      handleResend={otpStep.handleResend}
      handleUseDifferentIdentifier={otpStep.handleUseDifferentIdentifier}
    />
  );
}
