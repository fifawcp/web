/* eslint-disable no-console -- intentional console sink for dev-only logger */

const isDevelopment = process.env.NODE_ENV === "development";

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
