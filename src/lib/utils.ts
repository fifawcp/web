import { clsx, type ClassValue } from "clsx";
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

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
