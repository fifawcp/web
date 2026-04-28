import { z } from "zod";

const loginEmailSchema = z.email("errors.invalidEmail");

// TODO: review if schema match api constraints
export const loginIdentifierSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "errors.identifierRequired")
    .superRefine((val, ctx) => {
      if (val.includes("@")) {
        const result = loginEmailSchema.safeParse(val);
        if (!result.success) {
          const first = result.error.issues[0];
          ctx.addIssue({
            code: "custom",
            message: first?.message ?? "errors.invalidEmail",
          });
        }
        return;
      }
      if (val.length < 1) {
        ctx.addIssue({
          code: "custom",
          message: "errors.usernameMinLength",
        });
      } else if (val.length > 20) {
        ctx.addIssue({
          code: "custom",
          message: "errors.usernameMaxLength",
        });
      }
    }),
});

export const registerEmailSchema = z.object({
  email: z.email("errors.invalidEmail"),
});

export const otpSchema = z.object({
  code: z.string().length(6, "errors.otpLength").regex(/^\d+$/, "errors.otpDigitsOnly"),
});

export const profileSchema = z.object({
  username: z.string().min(1, "errors.usernameMinLength").max(20, "errors.usernameMaxLength").trim(),
  firstName: z.string().min(2, "errors.firstNameRequired").trim(),
  lastName: z.string().min(2, "errors.lastNameRequired").trim(),
});

export type LoginIdentifierFormData = z.infer<typeof loginIdentifierSchema>;
export type RegisterEmailFormData = z.infer<typeof registerEmailSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
