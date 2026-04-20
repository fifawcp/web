import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const envServerSchema = envSchema;

const envClientSchema = z.object({
  NEXT_PUBLIC_BACKEND_API_URL: z.url({ message: "Backend API URL is required" }),
  NEXT_PUBLIC_ENABLE_OTP_DEBUG: z.string().optional(),
});

export const env = envServerSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
});

export const clientEnv = envClientSchema.parse({
  NEXT_PUBLIC_BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  NEXT_PUBLIC_ENABLE_OTP_DEBUG: process.env.NEXT_PUBLIC_ENABLE_OTP_DEBUG,
});

export type Env = z.infer<typeof envSchema>;
export type ClientEnv = z.infer<typeof envClientSchema>;
