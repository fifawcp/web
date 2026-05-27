import { api } from "@/shared/lib/api/client";
import { refreshBackendAccessToken } from "@/shared/lib/api/refresh";
import { ApiResponse } from "@/shared/lib/api/types";
import { User } from "@/shared/types/interfaces";

import { AuthData, OtpPurpose, TokenResponse } from "../types/auth.types";

export const getDevTotp = async (identifier: string): Promise<ApiResponse<{ expiresIn: number; otp: string }>> => {
  return api.get<{ expiresIn: number; otp: string }>(`/api/debug/totp/${identifier}`);
};

type RequestOtpParams = { identifier: string; purpose: OtpPurpose };
export const requestOtp = async ({ identifier, purpose }: RequestOtpParams): Promise<ApiResponse> => {
  return api.post("/api/auth/otp/request", { identifier, purpose });
};

type VerifyOtpParams = { identifier: string; otp: string; purpose: OtpPurpose };
export const verifyOtpCode = async ({ identifier, otp, purpose }: VerifyOtpParams): Promise<ApiResponse> => {
  return api.post("/api/auth/otp/verify", { identifier, otp, purpose });
};

type ExchangeTokenParams = {
  identifier: string;
  otp: string;
  purpose: OtpPurpose;
  user?: { email: string; username: string; first_name: string; last_name: string };
};
export const exchangeToken = async ({ identifier, otp, purpose, user }: ExchangeTokenParams): Promise<ApiResponse<TokenResponse>> => {
  return api.post<TokenResponse>("/api/auth/token", { identifier, otp, purpose, ...(user ? { user } : {}) });
};

export const refreshToken = async (): Promise<ApiResponse<AuthData>> => {
  return refreshBackendAccessToken();
};

// Pass `authenticated: false` so an expired access token doesn't trigger a spurious refresh attempt
// The API reads the refresh cookie directly to find the session
export const logout = async (): Promise<ApiResponse> => {
  return api.post("/api/auth/logout", undefined, { authenticated: false });
};

export const getProfile = async (): Promise<ApiResponse<User>> => {
  return api.get<User>("/api/users/profile", { authenticated: true });
};

export const getGoogleOAuthUrl = (returnTo: string): string => {
  const url = new URL("/api/oauth/google", window.location.origin);
  url.searchParams.set("return_to", returnTo);
  return url.toString();
};
