"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { IconButton } from "@/components/ui/icon-button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <IconButton onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
      <Sun className="h-5 w-5 hidden dark:block text-zinc-100" />
      <Moon className="h-5 w-5 block dark:hidden text-zinc-900" />
    </IconButton>
  );
}
