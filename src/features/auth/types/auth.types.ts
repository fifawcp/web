import { User } from "@/shared/types/interfaces";

export type OtpRequestResponse = {
  message: string;
  expiresAt: string;
};

export interface AuthData {
  access_token: string;
  expires_at: string;
}

export type RefreshTokenResponse = {
  data: AuthData;
};

export type OtpVerifyResponse = {
  data: {
    message: string;
    auth: AuthData;
    user: User;
  };
};

export type OtpPurpose = "login" | "registration";
