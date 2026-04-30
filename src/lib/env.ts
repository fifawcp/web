import { z } from "zod";

// Server-only env - never shipped to the browser bundle
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  BACKEND_API_URL: z.url({ message: "BACKEND_API_URL is required" }),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  // Coerced because env vars are always strings - defaults to 7 days
  NEXTAUTH_SESSION_MAX_AGE: z.coerce
    .number()
    .int()
    .positive()
    .default(7 * 24 * 60 * 60),
});

export const env = serverSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  BACKEND_API_URL: process.env.BACKEND_API_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_SESSION_MAX_AGE: process.env.NEXTAUTH_SESSION_MAX_AGE,
});

export type Env = z.infer<typeof serverSchema>;
