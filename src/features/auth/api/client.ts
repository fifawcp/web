import { clientEnv } from "@/lib/env";
import { OtpPurpose, TokenResponse } from "../types/auth.types";
import { api } from "@/shared/lib/api/client";
import { ApiResponse } from "@/shared/lib/api/types";
import { User } from "@/shared/types/interfaces";


export const getDevTotp = async (identifier: string): Promise<ApiResponse<{ expiresIn: number; otp: string }>> => {
  return api.get<{ expiresIn: number; otp: string }>(
    `/api/debug/totp/${identifier}`,
  );
};

type RequestOtpParams = {
  identifier: string;
  purpose: OtpPurpose;
};


export const requestOtp = async ({ identifier, purpose }: RequestOtpParams): Promise<ApiResponse> => {
  return api.post("/api/auth/otp/request", { identifier, purpose });
};

type VerifyOtpParams = {
  identifier: string;
  otp: string;
  purpose: OtpPurpose;
};

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
  const payload = { identifier, otp, purpose, ...(user ? { user } : {}) };
  return api.post<TokenResponse>("/api/auth/token", payload);
};

export const refreshToken = async (): Promise<ApiResponse<Omit<TokenResponse, "user">>> => {
  return api.post<Omit<TokenResponse, "user">>("/api/auth/token/refresh");
};

export const logout = async (): Promise<ApiResponse> => {
  return api.post("/api/auth/logout");
};

export const getProfile = async (): Promise<ApiResponse<User>> => {
  return api.get<User>("/api/users/profile", { authenticated: true });
};

export const getGoogleOAuthUrl = (returnTo: string): string => {
  const oauthUrl = new URL("/api/oauth/google", clientEnv.NEXT_PUBLIC_BACKEND_API_URL);
  oauthUrl.searchParams.set("return_to", returnTo);

  return oauthUrl.toString();
};