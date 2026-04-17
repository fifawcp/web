import { ReactNode } from "react";
import { FloatingShape } from "@/components/ui/floating-shape";
import { FloatingShapeConfig } from "@/types/ui";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

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
];

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center bg-linear-to-b from-emerald-50/30 to-white dark:from-zinc-950 dark:to-zinc-900 px-4 py-12 overflow-hidden">
      {floatingShapes.map((shape, index) => (
        <FloatingShape key={index} {...shape} />
      ))}

      <div className="w-full max-w-md relative z-10 animate-appear">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{title}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8">{children}</div>
      </div>
    </div>
  );
}
