import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { FloatingShape, getRandomPosition } from "./floating-shape";

describe("getRandomPosition", () => {
  it("returns an object with top and left properties", () => {
    const position = getRandomPosition();
    expect(position).toHaveProperty("top");
    expect(position).toHaveProperty("left");
  });

  it("returns percentage values", () => {
    const position = getRandomPosition();
    expect(position.top).toMatch(/%$/);
    expect(position.left).toMatch(/%$/);
  });

  it("returns values between 0% and 100%", () => {
    const position = getRandomPosition();
    const topValue = parseInt(position.top);
    const leftValue = parseInt(position.left);

    expect(topValue).toBeGreaterThanOrEqual(0);
    expect(topValue).toBeLessThanOrEqual(100);
    expect(leftValue).toBeGreaterThanOrEqual(0);
    expect(leftValue).toBeLessThanOrEqual(100);
  });
});

describe("FloatingShape", () => {
  it("renders without crashing", () => {
    const { container } = render(<FloatingShape position={{ top: "10%", left: "20%" }} />);
    expect(container.firstChild).toBeDefined();
  });

  it("applies correct color class", () => {
    const { container } = render(<FloatingShape color="red" position={{ top: "10%", left: "20%" }} />);
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain("bg-wc-red");
  });

  it("applies correct shape class", () => {
    const { container } = render(<FloatingShape shape="square" position={{ top: "10%", left: "20%" }} />);
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain("rounded-lg");
  });

  it("applies correct animation class", () => {
    const { container } = render(<FloatingShape animation="float" position={{ top: "10%", left: "20%" }} />);
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain("animate-float");
  });

  it("applies custom position styles", () => {
    const { container } = render(<FloatingShape position={{ top: "50%", left: "30%" }} />);
    const element = container.firstChild as HTMLElement;
    expect(element.style.top).toBe("50%");
    expect(element.style.left).toBe("30%");
  });

  it("applies size styles", () => {
    const { container } = render(<FloatingShape size={64} position={{ top: "10%", left: "20%" }} />);
    const element = container.firstChild as HTMLElement;
    expect(element.style.width).toBe("64px");
    expect(element.style.height).toBe("64px");
  });

  it("applies opacity correctly", () => {
    const { container } = render(<FloatingShape opacity={50} position={{ top: "10%", left: "20%" }} />);
    const element = container.firstChild as HTMLElement;
    expect(element.style.opacity).toBe("0.5");
  });

  it("handles random position", () => {
    const { container } = render(<FloatingShape position="random" />);
    const element = container.firstChild as HTMLElement;
    expect(element.style.top).toBeDefined();
    expect(element.style.left).toBeDefined();
  });

  it("applies rotation transform when provided", () => {
    const { container } = render(<FloatingShape rotation={45} position={{ top: "10%", left: "20%" }} />);
    const element = container.firstChild as HTMLElement;
    expect(element.style.transform).toBe("rotate(45deg)");
  });
});
