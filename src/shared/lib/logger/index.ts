/**
 * Development-only logger utility
 * Only logs in development mode, silent in production
 */
/* eslint-disable no-console -- intentional console sink for dev-only logger */

import { env } from "@/lib/env";

const isDevelopment = env.NODE_ENV === "development";

export const logger = {
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
};
