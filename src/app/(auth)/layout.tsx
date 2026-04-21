"use client";

import { ReactNode } from "react";
import { FloatingShape } from "@/shared/components/ui/floating-shape";
import { FloatingShapeConfig } from "@/shared/types/ui";
import { GuestOnlyRoute } from "@/shared/routes/guest-only-route";

const floatingShapes: FloatingShapeConfig[] = [
  { color: "red", size: 96, opacity: 15, darkOpacity: 8, blur: "none", position: "random", animation: "float", animationDelay: 0 },
  { color: "orange", size: 128, opacity: 15, darkOpacity: 8, blur: "none", position: "random", animation: "drift", animationDelay: 1 },
  {
    color: "purple",
    shape: "diamond",
    size: 72,
    opacity: 18,
    darkOpacity: 10,
    blur: "none",
    position: "random",
    animation: "pulse",
    animationDelay: 0.5,
  },
  {
    color: "red",
    shape: "square",
    size: 64,
    opacity: 12,
    darkOpacity: 6,
    blur: "none",
    position: "random",
    rotation: 15,
    animation: "rotate",
    animationDuration: 20,
  },
  { color: "orange", size: 88, opacity: 20, darkOpacity: 10, blur: "none", position: "random", animation: "wave", animationDelay: 1.5 },
  {
    color: "purple",
    shape: "diamond",
    size: 56,
    opacity: 16,
    darkOpacity: 8,
    blur: "none",
    position: "random",
    animation: "zigzag",
    animationDelay: 2,
  },
  { color: "red-light", size: 96, opacity: 15, darkOpacity: 8, blur: "none", position: "random", animation: "float", animationDelay: 0 },
  { color: "red-light", size: 128, opacity: 15, darkOpacity: 8, blur: "none", position: "random", animation: "drift", animationDelay: 1 },
];

export default function AuthPagesLayout({ children }: { children: ReactNode }) {
  return (
    <GuestOnlyRoute>
      <div className="min-h-[calc(100vh-var(--header-height))] relative flex items-center justify-center bg-linear-to-b from-emerald-50/30 to-white dark:from-zinc-950 dark:to-zinc-900 px-4 py-12 overflow-hidden">
        {floatingShapes.map((shape, index) => (
          <FloatingShape key={index} {...shape} />
        ))}
        <div className="w-full max-w-md relative z-10">{children}</div>
      </div>
    </GuestOnlyRoute>
  );
}
