"use client";

import type { FloatingShapeConfig } from "@/shared/types/ui";

import { FloatingShape } from "./ui/floating-shape";

type Props = {
  shapes: FloatingShapeConfig[];
};

export function FloatingShapes({ shapes }: Props) {
  return (
    <>
      {shapes.map((shape, index) => (
        <FloatingShape key={index} {...shape} />
      ))}
    </>
  );
}
