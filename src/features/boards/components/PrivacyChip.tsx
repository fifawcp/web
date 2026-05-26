import { Globe, Lock, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import type { BoardPrivacy } from "../types/boards.types";

const ICONS = { private: Lock, public: Users, global: Globe } as const;

type Props = {
  privacy: BoardPrivacy;
  className?: string;
  size?: "sm" | "xs";
};

export function PrivacyChip({ privacy, className, size = "sm" }: Props) {
  const t = useTranslations("boards.privacy");
  const Icon = ICONS[privacy];
  const isSm = size === "sm";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-muted font-medium text-muted-foreground",
        isSm ? "h-5 px-1.5 text-2xs" : "h-4 px-1 text-[0.625rem]",
        className
      )}
    >
      <Icon className={cn(isSm ? "size-3" : "size-2.5")} aria-hidden />
      <span className="uppercase tracking-wide">{t(privacy)}</span>
    </span>
  );
}
