import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({
    message: "auth.errors.invalidEmail",
  }),
});

export const registerSchema = z.object({
  username: z.string().min(3, "auth.errors.usernameMinLength").max(20, "auth.errors.usernameMaxLength").trim(),
  first_name: z.string().min(2, "auth.errors.firstNameRequired").trim(),
  last_name: z.string().min(2, "auth.errors.lastNameRequired").trim(),
  email: z.email({
    message: "auth.errors.invalidEmail",
  }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "auth.errors.termsRequired",
  }),
});

export const otpVerifySchema = z.object({
  code: z.string().length(6, "auth.errors.otpLength").regex(/^\d+$/, "auth.errors.otpDigitsOnly"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OtpVerifyFormData = z.infer<typeof otpVerifySchema>;
export type OtpRequestData = { email: string; type: "login" | "register" };
