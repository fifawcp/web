"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

type Props = {
  children: ReactNode;
  className?: string;
  // Max tilt in degrees toward the pointer.
  maxTilt?: number;
};

// Pointer-tracked 3D tilt + parallax. Children tagged with `data-depth="<px>"`
// drift toward the cursor for a layered effect. On touch devices it does a
// gentle auto-float; honours prefers-reduced-motion (no motion).
export function TiltCard({ children, className, maxTilt = 4 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    // Fine pointer + motion allowed → interactive tilt.
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      gsap.set(el, { transformPerspective: 900, transformStyle: "preserve-3d" });
      const rotX = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
      const rotY = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });

      const layers = gsap.utils.toArray<HTMLElement>(el.querySelectorAll("[data-depth]")).map((node) => ({
        depth: Number(node.dataset.depth) || 0,
        x: gsap.quickTo(node, "x", { duration: 0.5, ease: "power3.out" }),
        y: gsap.quickTo(node, "y", { duration: 0.5, ease: "power3.out" }),
      }));

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        rotY(px * maxTilt * 2);
        rotX(-py * maxTilt * 2);
        layers.forEach((layer) => {
          layer.x(px * layer.depth);
          layer.y(py * layer.depth);
        });
      };
      const onLeave = () => {
        rotX(0);
        rotY(0);
        layers.forEach((layer) => {
          layer.x(0);
          layer.y(0);
        });
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    });

    // Touch devices → subtle auto-float (skipped under reduced motion).
    mm.add("(hover: none) and (prefers-reduced-motion: no-preference)", () => {
      gsap.set(el, { transformPerspective: 900 });
      const tween = gsap.to(el, { rotateY: 2.5, y: -5, duration: 3.5, ease: "sine.inOut", yoyo: true, repeat: -1 });
      return () => tween.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={ref} className={className} style={{ transformStyle: "preserve-3d", willChange: "transform" }}>
      {children}
    </div>
  );
}
