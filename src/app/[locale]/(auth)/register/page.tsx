"use client";

import { useEffect } from "react";
import { Mail, MoveLeft, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import { AuthActionLink } from "@/features/auth/components/AuthActionLink";
import { AuthOtpStep } from "@/features/auth/components/AuthOtpStepCard";
import { AuthStepHeaderIcon } from "@/features/auth/components/AuthStepHeaderIcon";
import { ErrorAlert } from "@/features/auth/components/ErrorAlert";
import { FieldMessageSlot } from "@/features/auth/components/FieldMessageSlot";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { StepGuard } from "@/features/auth/components/StepGuard";
import { StepIndicator } from "@/features/auth/components/StepIndicator";
import { useRegisterEmailStep } from "@/features/auth/hooks/useRegisterEmailStep";
import { useRegisterOtpStep } from "@/features/auth/hooks/useRegisterOtpStep";
import { useRegisterProfileStep } from "@/features/auth/hooks/useRegisterProfileStep";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";

type RegisterStep = "email" | "otp" | "profile";

const STEPS = ["step_identifier", "step_verify", "step_profile"] as const;

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stepParam = searchParams.get("step");
  const step: RegisterStep = stepParam === "email" || stepParam === "otp" || stepParam === "profile" ? stepParam : "email";
  const stepIndex = step === "otp" ? 1 : step === "profile" ? 2 : 0;

  useEffect(() => {
    if (stepParam === null || stepParam === step) return;
    router.replace(`?step=${step}`);
  }, [router, step, stepParam]);

  const pageContent = <RegisterPageShell stepIndex={stepIndex}>{step === "profile" ? <ProfileStep /> : step === "otp" ? <OtpStep /> : <EmailStep />}</RegisterPageShell>;

  if (step === "profile") {
    return (
      <StepGuard requiredFields={["identifier", "otp"]} redirectTo="?step=otp">
        {pageContent}
      </StepGuard>
    );
  }

  if (step === "otp") {
    return <StepGuard requiredFields={["identifier"]}>{pageContent}</StepGuard>;
  }

  return pageContent;
}

function RegisterPageShell({ stepIndex, children }: { stepIndex: number; children: React.ReactNode }) {
  const t = useTranslations("auth.register");

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 max-w-md">
      <StepIndicator steps={STEPS.map((s) => t(s))} currentStep={stepIndex} />
      <Card className="bg-card w-full">{children}</Card>
      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}

function EmailStep() {
  const t = useTranslations("auth");
  const { form, apiError, onSubmit } = useRegisterEmailStep();

  return (
    <>
      <CardHeader className="space-y-1 text-center">
        <AuthStepHeaderIcon icon={Mail} />
        <CardTitle className="text-2xl">{t("register.title")}</CardTitle>
        <CardDescription>{t("register.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ErrorAlert message={apiError.message} />
        <form id="register-email-form" onSubmit={onSubmit} className="space-y-4">
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
                    {fieldState.invalid && fieldState.error?.message ? <FieldError errors={[{ message: t(fieldState.error.message) }]} /> : null}
                  </FieldMessageSlot>
                </Field>
              )}
            />
          </FieldGroup>
          <Button type="submit" form="register-email-form" className="w-full" disabled={form.formState.isSubmitting}>
            {t("register.continue")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-6">
        <div className="flex w-full flex-row items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("register.orContinueWithEmail")}</span>
          <Separator className="flex-1" />
        </div>
        <GoogleButton label={t("register.googleSignIn")} />
      </CardFooter>
    </>
  );
}

function OtpStep() {
  const otpStep = useRegisterOtpStep();

  return (
    <AuthOtpStep
      formId="register-otp-form"
      otpInputId="register-otp-code"
      differentIdentifierHref="/register?step=email"
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

function ProfileStep() {
  const t = useTranslations("auth");
  const { form, apiError, onSubmit, handleBack } = useRegisterProfileStep();

  return (
    <>
      <CardHeader className="space-y-1 text-center">
        <AuthStepHeaderIcon icon={User} />
        <CardTitle className="text-2xl">{t("profile.title")}</CardTitle>
        <CardDescription>{t("profile.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ErrorAlert message={apiError.message} />
        <form id="register-profile-form" onSubmit={onSubmit} className="space-y-4">
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
                    {fieldState.invalid && fieldState.error?.message ? <FieldError errors={[{ message: t(fieldState.error.message) }]} /> : null}
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
                  <Input {...field} id="register-last-name" aria-invalid={fieldState.invalid} placeholder={t("profile.lastNamePlaceholder")} autoComplete="family-name" />
                  <FieldMessageSlot>
                    {fieldState.invalid && fieldState.error?.message ? <FieldError errors={[{ message: t(fieldState.error.message) }]} /> : null}
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
                <Input {...field} id="register-username" aria-invalid={fieldState.invalid} placeholder={t("profile.usernamePlaceholder")} autoComplete="username" />
                <FieldMessageSlot>
                  {fieldState.invalid && fieldState.error?.message ? <FieldError errors={[{ message: t(fieldState.error.message) }]} /> : null}
                </FieldMessageSlot>
              </Field>
            )}
          />
        </form>
      </CardContent>
      <CardFooter>
        <div className="grid w-full grid-cols-12 gap-3">
          <AuthActionLink href="/register?step=otp" onClick={handleBack} icon={MoveLeft} label={t("profile.back")} className="col-span-4 justify-center" />
          <Button type="submit" form="register-profile-form" className="col-span-8 font-semibold" disabled={form.formState.isSubmitting}>
            {t("profile.createAccount")}
          </Button>
        </div>
      </CardFooter>
    </>
  );
}
