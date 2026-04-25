import "next-auth";
import { DefaultSession } from "next-auth";

// Shared user fields to avoid repetition
interface UserFields {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Shared auth fields
interface AuthFields {
  access_token: string;
  expires_at: string;
}

declare module "next-auth" {
  interface Session {
    user: UserFields & DefaultSession["user"];
    access_token: string;
    expires_at: string;
  }

  interface User extends UserFields, AuthFields {}
}

declare module "next-auth/jwt" {
  interface JWT extends UserFields, AuthFields {}
}
