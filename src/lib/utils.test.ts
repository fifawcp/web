import { describe, it, expect } from "vitest";
import { cn, getRandomPosition } from "./utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "visible");
    expect(result).toBe("base visible");
  });

  it("merges tailwind classes correctly", () => {
    const result = cn("p-4", "p-8");
    expect(result).toBe("p-8");
  });
});

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
