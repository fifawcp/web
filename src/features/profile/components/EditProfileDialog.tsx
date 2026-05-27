"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { profileSchema, type ProfileFormData } from "@/features/auth/schemas/auth.schema";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

import type { EditableProfileFields } from "../api/profile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current values used as the form's initial state — read once per open cycle. */
  initial: EditableProfileFields;
  /** Fires after a successful save so the parent can patch local UI state. */
  onSaved?: (next: EditableProfileFields) => void;
};

/**
 * Edit identity fields (first name, last name, username). Uses the same
 * `profileSchema` as registration to ensure consistent validation rules.
 *
 * The form lives in `<EditProfileForm>` and is only rendered while the
 * dialog is open. This way every open cycle gets a fresh form state
 * seeded from the latest `initial` prop.
 */
export function EditProfileDialog({ open, onOpenChange, initial, onSaved }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>{open && <EditProfileForm initial={initial} onSaved={onSaved} onClose={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  );
}

function EditProfileForm({ initial, onSaved, onClose }: { initial: EditableProfileFields; onSaved?: (next: EditableProfileFields) => void; onClose: () => void }) {
  const t = useTranslations("profile.editDialog");
  const tAuth = useTranslations("auth");
  const mutation = useUpdateProfile();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: initial.username,
      firstName: initial.first_name,
      lastName: initial.last_name,
    },
  });

  const isDirty = form.formState.isDirty;
  const canSubmit = isDirty && !mutation.isPending;

  const onSubmit = form.handleSubmit(async (data) => {
    const payload: EditableProfileFields = {
      first_name: data.firstName,
      last_name: data.lastName,
      username: data.username,
    };

    try {
      console.log(payload);
      const saved = await mutation.mutateAsync(payload);
      toast.success(t("success"));
      onSaved?.(saved);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("error"));
    }
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription>{t("description")}</DialogDescription>
      </DialogHeader>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-first-name">{t("firstName")}</FieldLabel>
                <Input
                  {...field}
                  id="profile-first-name"
                  autoComplete="given-name"
                  autoFocus
                  disabled={mutation.isPending}
                  aria-invalid={fieldState.invalid}
                  className="focus-visible:border-page-accent-strong focus-visible:ring-page-accent-strong/30"
                />
                {fieldState.invalid && fieldState.error?.message && <FieldError errors={[{ message: tAuth(fieldState.error.message) }]} />}
              </Field>
            )}
          />
          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-last-name">{t("lastName")}</FieldLabel>
                <Input
                  {...field}
                  id="profile-last-name"
                  autoComplete="family-name"
                  disabled={mutation.isPending}
                  aria-invalid={fieldState.invalid}
                  className="focus-visible:border-page-accent-strong focus-visible:ring-page-accent-strong/30"
                />
                {fieldState.invalid && fieldState.error?.message && <FieldError errors={[{ message: tAuth(fieldState.error.message) }]} />}
              </Field>
            )}
          />
        </div>

        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="profile-username">{t("username")}</FieldLabel>
              <Input
                {...field}
                id="profile-username"
                autoComplete="username"
                disabled={mutation.isPending}
                aria-invalid={fieldState.invalid}
                className="focus-visible:border-page-accent-strong focus-visible:ring-page-accent-strong/30"
              />
              {fieldState.invalid && fieldState.error?.message ? (
                <FieldError errors={[{ message: tAuth(fieldState.error.message) }]} />
              ) : (
                <FieldDescription>{t("usernameHint")}</FieldDescription>
              )}
            </Field>
          )}
        />

        <DialogFooter className="flex-col sm:flex-row-reverse sm:justify-start">
          <Button type="submit" disabled={!canSubmit} className="gap-1.5 bg-page-accent text-white hover:bg-page-accent/90">
            {mutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
            {mutation.isPending ? t("saving") : t("save")}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
            {t("cancel")}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
