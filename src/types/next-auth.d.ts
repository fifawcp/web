import "next-auth";
import { DefaultSession } from "next-auth";

import type { User as DomainUser } from "@/shared/types/interfaces";

// Shared auth fields — these only exist on the next-auth session, never
// on the upstream `domain.User` shape, so they stay local.
interface AuthFields {
  access_token: string;
  expires_at: string;
}

declare module "next-auth" {
  interface Session {
    user: DomainUser & DefaultSession["user"];
    access_token: string;
    expires_at: string;
  }

  interface User extends DomainUser, AuthFields {}
}

declare module "next-auth/jwt" {
  interface JWT extends DomainUser, AuthFields {}
}
