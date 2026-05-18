import { Moon, Sun } from "lucide-react";

/** Theme options exposed in the UI. `system` is intentionally omitted. */
export const THEMES = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
] as const;

/** Supported locales — `code` maps to the i18n message folders. */
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;
