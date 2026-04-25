import { OtpRequestResponse, OtpVerifyResponse, OtpPurpose } from "../types/auth.types";
import { clientEnv } from "@/lib/env";
import { api } from "@/shared/lib/api/client";
import { ApiResponse } from "@/shared/lib/api/types";
import { logger } from "@/shared/lib/logger";

export const requestOtp = async ({ identifier, purpose }: { identifier: string; purpose: OtpPurpose }): Promise<ApiResponse<OtpRequestResponse>> => {
  return api.post<OtpRequestResponse>("/api/auth/otp/request", { identifier, purpose }, { skipRefresh: true });
};

const getBedugOTP = async (identifier: string) => {
  try {
    const response = await api.get<{ data: { otp: string } }>(`/api/debug/totp/${identifier}`, { skipRefresh: true });
    if (response.success && response.data) {
      return response.data.data.otp;
    }
  } catch (error) {
    logger.error("Failed to fetch debug OTP:", error);
  }
  return null;
};

export const verifyOtp = async ({
  identifier,
  code,
  purpose,
  username,
  first_name,
  last_name,
}: {
  identifier: string;
  code: string;
  purpose: OtpPurpose;
  username?: string;
  first_name?: string;
  last_name?: string;
}): Promise<ApiResponse<OtpVerifyResponse>> => {
  let otpCode = code;

  if (clientEnv.NEXT_PUBLIC_ENABLE_OTP_DEBUG) {
    try {
      const debugOtp = await getBedugOTP(identifier);
      if (debugOtp) {
        otpCode = debugOtp;
      }
    } catch (error) {
      logger.error("Failed to fetch debug OTP:", error);
    }
  }

  const payload = {
    identifier,
    otp: otpCode,
    purpose,
    ...(purpose === "registration" && username && first_name && last_name
      ? {
          user: {
            email: identifier,
            first_name,
            last_name,
            username,
          },
        }
      : {}),
  };

  return api.post<OtpVerifyResponse>("/api/auth/token", payload, { skipRefresh: true });
};

export const logout = async (): Promise<ApiResponse<void>> => {
  return api.post<void>("/api/auth/logout", undefined, { skipRefresh: true });
};
