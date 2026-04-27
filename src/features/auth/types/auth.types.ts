import { User } from "@/shared/types/interfaces";

export type OtpPurpose = "login" | "registration";

export type TokenResponse = {
  access_token: string;
  expires_at: string;
  user: User;
};

export type RefreshTokenResponse = {
  access_token: string;
  expires_at: string;
};

