import { User } from "@/shared/types/interfaces";

export type OtpPurpose = "login" | "registration";

export type AuthData = {
  access_token: string;
  expires_at: string;
};

export type TokenResponse = {
  user: User;
  auth: AuthData;
};

export type NextAuthCredentialsPayload = AuthData & {
  user: User;
};
