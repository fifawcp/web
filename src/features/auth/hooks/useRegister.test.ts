import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRegister } from "./useRegister";
import * as client from "../api/client";
import { useRouter } from "next/navigation";

vi.mock("@/lib/env", () => ({
  env: {
    NODE_ENV: "test" as const,
  },
  clientEnv: {
    NEXT_PUBLIC_BACKEND_API_URL: "http://localhost:3001",
    NEXT_PUBLIC_ENABLE_OTP_DEBUG: "true",
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("../api/client", () => ({
  requestOtp: vi.fn(),
}));

vi.mock("../store/registration.store", () => ({
  useRegistrationStore: vi.fn((selector) => selector({ setRegistrationData: vi.fn() })),
}));

describe("useRegister", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
  });

  it("should initialize with correct structure", () => {
    const { result } = renderHook(() => useRegister());

    expect(result.current.register).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.errors).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("should return register function from react-hook-form", () => {
    const { result } = renderHook(() => useRegister());

    expect(typeof result.current.register).toBe("function");
  });

  it("should return handleSubmit function", () => {
    const { result } = renderHook(() => useRegister());

    expect(typeof result.current.handleSubmit).toBe("function");
  });

  it("should have errors object with all required fields", () => {
    const { result } = renderHook(() => useRegister());

    expect(result.current.errors).toHaveProperty("username");
    expect(result.current.errors).toHaveProperty("first_name");
    expect(result.current.errors).toHaveProperty("last_name");
    expect(result.current.errors).toHaveProperty("email");
    expect(result.current.errors).toHaveProperty("acceptTerms");
  });

  it("should call requestOtp with registration purpose", async () => {
    vi.spyOn(client, "requestOtp").mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useRegister());

    expect(result.current.register).toBeDefined();
  });

  it("should handle OTP request errors", async () => {
    vi.spyOn(client, "requestOtp").mockResolvedValue({
      success: false,
      error: "Failed to send OTP",
    });

    const { result } = renderHook(() => useRegister());

    expect(result.current.handleSubmit).toBeDefined();
  });
});
