import { cn } from "@/shared/lib/utils";
import { FloatingShapeProps, ColorVariant, ShapeType, AnimationType, BlurType } from "@/shared/types/ui";

export function getRandomPosition(): { top: string; left: string } {
  const top = Math.floor(Math.random() * 101);
  const left = Math.floor(Math.random() * 101);
  return {
    top: `${top}%`,
    left: `${left}%`,
  };
}

const colorMap: Record<ColorVariant, string> = {
  red: "bg-wc-red",
  orange: "bg-wc-orange",
  purple: "bg-wc-purple",
  "red-light": "bg-wc-red-light",
};

const blurMap: Record<BlurType, string> = {
  none: "",
  sm: "blur-sm",
  md: "blur-md",
  lg: "blur-lg",
  xl: "blur-xl",
  "2xl": "blur-2xl",
  "3xl": "blur-3xl",
};

const shapeMap: Record<ShapeType, string> = {
  circle: "rounded-full",
  square: "rounded-lg",
  diamond: "rounded-lg rotate-45",
};

const animationMap: Record<AnimationType, string> = {
  float: "animate-float",
  bounce: "animate-bounce-slow",
  drift: "animate-drift",
  pulse: "animate-pulse-slow",
  rotate: "animate-rotate-slow",
  wave: "animate-wave",
  zigzag: "animate-zigzag",
  none: "",
};

export function FloatingShape({
  shape = "circle",
  color = "red",
  size = 32,
  opacity = 20,
  blur = "none",
  position,
  rotation = 0,
  animation = "float",
  animationDelay = 0,
  animationDuration = 6,
  darkOpacity,
  className,
}: FloatingShapeProps) {
  const positionStyles =
    position === "random"
      ? getRandomPosition()
      : {
          ...(position.top && { top: position.top }),
          ...(position.bottom && { bottom: position.bottom }),
          ...(position.left && { left: position.left }),
          ...(position.right && { right: position.right }),
        };

  const lightModeOpacity = opacity * 0.01;
  const darkModeOpacity = darkOpacity ? darkOpacity * 0.01 : opacity * 0.01;

  return (
    <div
      className={cn("absolute pointer-events-none", colorMap[color], blurMap[blur], shapeMap[shape], animationMap[animation], className)}
      style={{
        ...positionStyles,
        width: `${size}px`,
        height: `${size}px`,
        opacity: lightModeOpacity,
        transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
        animationDelay: animationDelay > 0 ? `${animationDelay}s` : undefined,
        animationDuration: `${animationDuration}s`,
        ["--dark-opacity" as string]: darkModeOpacity,
      }}
      suppressHydrationWarning
    />
  );
}
