import { describe, it, expect } from "vitest";
import { validateEmail, validateLoginForm, validateRegisterForm } from "./auth.schema";

describe("validateEmail", () => {
  it("returns true for valid email", () => {
    expect(validateEmail("test@example.com")).toBe(true);
  });

  it("returns false for invalid email", () => {
    expect(validateEmail("invalid-email")).toBe(false);
    expect(validateEmail("@example.com")).toBe(false);
    expect(validateEmail("test@")).toBe(false);
  });
});

describe("validateLoginForm", () => {
  it("returns valid for correct login data", () => {
    const result = validateLoginForm({
      email: "test@example.com",
    });
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it("returns error for invalid email", () => {
    const result = validateLoginForm({
      email: "invalid-email",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe("auth.errors.invalidEmail");
  });
});

describe("validateRegisterForm", () => {
  it("returns valid for correct registration data", () => {
    const result = validateRegisterForm({
      name: "John Doe",
      email: "test@example.com",
      acceptTerms: true,
    });
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it("returns error for empty name", () => {
    const result = validateRegisterForm({
      name: "",
      email: "test@example.com",
      acceptTerms: true,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe("auth.errors.nameRequired");
  });

  it("returns error when terms not accepted", () => {
    const result = validateRegisterForm({
      name: "John Doe",
      email: "test@example.com",
      acceptTerms: false,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.acceptTerms).toBe("auth.errors.termsRequired");
  });
});
