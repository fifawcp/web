import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const envServerSchema = envSchema;

const envClientSchema = z.object({
  NEXT_PUBLIC_BACKEND_API_URL: z.url({ message: "Backend API URL is required" }),
});

export const env = envServerSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
});

export const clientEnv = envClientSchema.parse({
  NEXT_PUBLIC_BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
});

export const isProd = process.env.NODE_ENV === "production";

export type Env = z.infer<typeof envSchema>;
export type ClientEnv = z.infer<typeof envClientSchema>;
