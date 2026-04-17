export type ColorVariant = "red" | "orange" | "purple";
export type ShapeType = "circle" | "square" | "diamond";
export type AnimationType = "float" | "bounce" | "drift" | "pulse" | "rotate" | "wave" | "zigzag" | "none";
export type BlurType = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export type Position =
  | "random"
  | {
      top?: string;
      bottom?: string;
      left?: string;
      right?: string;
    };

export type FloatingShapeProps = {
  shape?: ShapeType;
  color?: ColorVariant;
  size?: number;
  opacity?: number;
  blur?: BlurType;
  position: Position;
  rotation?: number;
  animation?: AnimationType;
  animationDelay?: number;
  animationDuration?: number;
  darkOpacity?: number;
  className?: string;
};

export type FloatingShapeConfig = FloatingShapeProps;
