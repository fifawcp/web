export type ShapeType = "circle" | "square" | "diamond";
export type ColorVariant = "red" | "orange" | "purple";
export type AnimationType = "float" | "bounce" | "drift" | "pulse" | "rotate" | "wave" | "zigzag" | "none";
export type BlurType = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export interface FloatingShapeProps {
  shape?: ShapeType;
  color?: ColorVariant;
  size?: number;
  opacity?: number;
  blur?: BlurType;
  position:
    | {
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
      }
    | "random";
  rotation?: number;
  animation?: AnimationType;
  animationDelay?: number;
  animationDuration?: number;
  darkOpacity?: number;
  className?: string;
}

export type FloatingShapeConfig = {
  color: ColorVariant;
  shape?: ShapeType;
  size: number;
  opacity: number;
  darkOpacity?: number;
  blur?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  position: { top?: string; bottom?: string; left?: string; right?: string } | "random";
  rotation?: number;
  animation: AnimationType;
  animationDelay?: number;
  animationDuration?: number;
};
