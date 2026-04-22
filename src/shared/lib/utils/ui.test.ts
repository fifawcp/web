import { describe, it, expect } from "vitest";
import { cn } from "./ui";

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
