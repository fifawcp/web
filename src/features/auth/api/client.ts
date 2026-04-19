import { ApiResponse, OtpRequestResponse, OtpVerifyResponse, OtpPurpose } from "../types/auth.types";
import { clientEnv } from "@/lib/env";

export const requestOtp = async ({ identifier, purpose }: { identifier: string; purpose: OtpPurpose }): Promise<ApiResponse<OtpRequestResponse>> => {
  try {
    const url = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/auth/otp/request`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, purpose }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        error: data.error || data.message || "Failed to request OTP",
        message: data.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("OTP Request Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};

const getBedugOTP = async (identifier: string) => {
  try {
    const debugResponse = await fetch(`${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/debug/totp/${identifier}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      return debugData.data.otp;
    }
  } catch (error) {
    console.error("Failed to fetch debug OTP:", error);
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
  try {
    let otpCode = code;

    if (clientEnv.NEXT_PUBLIC_ENABLE_OTP_DEBUG) {
      try {
        const debugOtp = await getBedugOTP(identifier);
        if (debugOtp) {
          otpCode = debugOtp;
        }
      } catch (error) {
        console.error("Failed to fetch debug OTP:", error);
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

    const url = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/auth/token`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || "Failed to verify OTP",
        message: data.message,
      };
    }

    return {
      success: true,
      data,
      message: data.message,
    };
  } catch (error) {
    console.error("OTP Verify Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
