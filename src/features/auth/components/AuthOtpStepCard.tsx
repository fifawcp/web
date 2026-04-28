"use client";

import { MoveLeft, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import type { UseCountdownResult } from "@/features/auth/hooks/useCountdown";
import type { OtpFormData } from "@/features/auth/schemas/auth.schema";
import { formatCountdown } from "@/features/auth/utils";
import { Button } from "@/shared/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/shared/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/ui/input-otp";
import { Separator } from "@/shared/components/ui/separator";
import { useApiError } from "@/shared/hooks/useApiError";

import { AuthActionLink } from "./AuthActionLink";
import { AuthStepHeaderIcon } from "./AuthStepHeaderIcon";
import { ErrorAlert } from "./ErrorAlert";
import { FieldMessageSlot } from "./FieldMessageSlot";
import { OtpDevTotpFill } from "./OtpDevTotpFill";

type ApiErrorState = ReturnType<typeof useApiError>;

export interface AuthOtpStepProps {
  formId: string;
  otpInputId: string;
  differentIdentifierHref: string;
  form: UseFormReturn<OtpFormData>;
  apiError: ApiErrorState;
  identifier: string;
  countdown: UseCountdownResult;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleResend: () => void | Promise<void>;
  handleUseDifferentIdentifier: () => void;
}

export function AuthOtpStep({
  formId,
  otpInputId,
  differentIdentifierHref,
  form,
  apiError,
  identifier,
  countdown,
  onSubmit,
  handleResend,
  handleUseDifferentIdentifier,
}: AuthOtpStepProps) {
  const t = useTranslations("auth");
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
        <form id={formId} onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex justify-center">
                    <InputOTP
                      {...field}
                      id={otpInputId}
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

        <Button type="submit" form={formId} className="w-full" disabled={form.formState.isSubmitting || otpValue.length !== 6}>
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
          <AuthActionLink href={differentIdentifierHref} onClick={handleUseDifferentIdentifier} icon={MoveLeft} label={t("otp.useDifferentEmail")} />
        </div>
      </CardContent>
    </>
  );
}
