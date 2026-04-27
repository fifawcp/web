import { ReactNode } from "react";
import { FloatingShape } from "@/shared/components/ui/floating-shape";
import { FloatingShapeConfig } from "@/shared/types/ui";

const floatingShapes: FloatingShapeConfig[] = [
  { color: "red", size: 96, opacity: 8, darkOpacity: 4, blur: "none", position: "random", animation: "float", animationDelay: 0 },
  { color: "orange", size: 128, opacity: 8, darkOpacity: 4, blur: "none", position: "random", animation: "drift", animationDelay: 1 },
  {
    color: "purple",
    shape: "diamond",
    size: 72,
    opacity: 9,
    darkOpacity: 5,
    blur: "none",
    position: "random",
    animation: "pulse",
    animationDelay: 0.5,
  },
  {
    color: "red",
    shape: "square",
    size: 64,
    opacity: 6,
    darkOpacity: 3,
    blur: "none",
    position: "random",
    rotation: 15,
    animation: "rotate",
    animationDuration: 20,
  },
  { color: "orange", size: 88, opacity: 10, darkOpacity: 5, blur: "none", position: "random", animation: "wave", animationDelay: 1.5 },
  {
    color: "purple",
    shape: "diamond",
    size: 56,
    opacity: 8,
    darkOpacity: 4,
    blur: "none",
    position: "random",
    animation: "zigzag",
    animationDelay: 2,
  },
  { color: "red-light", size: 96, opacity: 8, darkOpacity: 4, blur: "none", position: "random", animation: "float", animationDelay: 0 },
  { color: "red-light", size: 128, opacity: 8, darkOpacity: 4, blur: "none", position: "random", animation: "drift", animationDelay: 1 },
];

export default function AuthPagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100dvh-var(--header-height))] relative flex items-center justify-center bg-background px-4 pt-8 pb-[15vh] overflow-hidden">
      {floatingShapes.map((shape, index) => (
        <FloatingShape key={index} {...shape} />
      ))}
      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  );
}
