import { cn } from "@/shared/lib/utils";

import type { Board } from "../types/boards.types";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || name.slice(0, 2).toUpperCase();

type Props = {
  board: Pick<Board, "name" | "privacy">;
  className?: string;
};

export function BoardSquare({ board, className }: Props) {
  const isGlobal = board.privacy === "global";
  return (
    <span
      className={cn(
        "grid place-items-center rounded-md text-2xs font-semibold uppercase",
        isGlobal ? "bg-page-accent-strong text-background" : "bg-page-accent-soft text-page-accent-strong",
        className
      )}
      aria-hidden
    >
      {initials(board.name)}
    </span>
  );
}
