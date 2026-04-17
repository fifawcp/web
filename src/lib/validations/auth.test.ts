import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateLoginForm,
  validateRegisterForm,
} from "./auth";

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

describe("validatePassword", () => {
  it("returns true for password with 8+ characters", () => {
    expect(validatePassword("password123")).toBe(true);
  });

  it("returns false for password with less than 8 characters", () => {
    expect(validatePassword("pass")).toBe(false);
  });
});

describe("validatePasswordMatch", () => {
  it("returns true when passwords match", () => {
    expect(validatePasswordMatch("password123", "password123")).toBe(true);
  });

  it("returns false when passwords don't match", () => {
    expect(validatePasswordMatch("password123", "different")).toBe(false);
  });
});

describe("validateLoginForm", () => {
  it("returns valid for correct login data", () => {
    const result = validateLoginForm({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it("returns error for invalid email", () => {
    const result = validateLoginForm({
      email: "invalid-email",
      password: "password123",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe("auth.errors.invalidEmail");
  });

  it("returns error for short password", () => {
    const result = validateLoginForm({
      email: "test@example.com",
      password: "short",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.password).toBe("auth.errors.passwordTooShort");
  });
});

describe("validateRegisterForm", () => {
  it("returns valid for correct registration data", () => {
    const result = validateRegisterForm({
      name: "John Doe",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
      acceptTerms: true,
    });
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it("returns error for empty name", () => {
    const result = validateRegisterForm({
      name: "",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
      acceptTerms: true,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe("auth.errors.nameRequired");
  });

  it("returns error for password mismatch", () => {
    const result = validateRegisterForm({
      name: "John Doe",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "different",
      acceptTerms: true,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.confirmPassword).toBe("auth.errors.passwordsDoNotMatch");
  });

  it("returns error when terms not accepted", () => {
    const result = validateRegisterForm({
      name: "John Doe",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
      acceptTerms: false,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.acceptTerms).toBe("auth.errors.termsRequired");
  });
});
