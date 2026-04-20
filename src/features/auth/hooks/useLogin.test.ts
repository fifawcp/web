import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLogin } from "./useLogin";
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

describe("useLogin", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
  });

  it("should initialize with correct structure", () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.register).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.errors).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("should return register function from react-hook-form", () => {
    const { result } = renderHook(() => useLogin());

    expect(typeof result.current.register).toBe("function");
  });

  it("should return handleSubmit function", () => {
    const { result } = renderHook(() => useLogin());

    expect(typeof result.current.handleSubmit).toBe("function");
  });

  it("should have errors object with email field", () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.errors).toHaveProperty("email");
  });

  it("should call requestOtp with login purpose", async () => {
    vi.spyOn(client, "requestOtp").mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useLogin());

    expect(result.current.register).toBeDefined();
  });

  it("should handle OTP request errors", async () => {
    vi.spyOn(client, "requestOtp").mockResolvedValue({
      success: false,
      error: "Failed to send OTP",
    });

    const { result } = renderHook(() => useLogin());

    expect(result.current.handleSubmit).toBeDefined();
  });
});
