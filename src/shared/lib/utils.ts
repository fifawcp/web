import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomPosition(): { top: string; left: string } {
  const top = Math.floor(Math.random() * 101);
  const left = Math.floor(Math.random() * 101);
  return {
    top: `${top}%`,
    left: `${left}%`,
  };
}
