import { logger } from "@/shared/lib/logger";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        accessToken: { label: "Access Token", type: "text" },
        expiresAt: { label: "Expires At", type: "text" },
        userData: { label: "User Data", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        try {
          // Check if this is an OTP-verified login (has accessToken and userData)
          if (credentials.accessToken && credentials.userData) {
            // OTP was already verified by backend, just create session
            const user = JSON.parse(credentials.userData);

            return {
              id: user.id,
              username: user.username,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              created_at: user.created_at,
              updated_at: user.updated_at,
              access_token: credentials.accessToken,
              expires_at: credentials.expiresAt,
            };
          }

          // This shouldn't happen in normal flow (OTP-only auth)
          // But keeping for backward compatibility
          return null;
        } catch (error) {
          logger.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.email = user.email;
        token.created_at = user.created_at;
        token.updated_at = user.updated_at;
        token.access_token = user.access_token;
        token.expires_at = user.expires_at;
      }

      // Check if token is expired and refresh if needed
      if (token.expires_at && typeof token.expires_at === "string") {
        const expiresAt = new Date(token.expires_at);
        const now = new Date();

        // Refresh token 5 minutes before expiry
        if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/auth/refresh`, {
              method: "POST",
              credentials: "include",
            });

            if (res.ok) {
              const data = await res.json();
              if (data.success && data.data) {
                token.access_token = data.data.access_token;
                token.expires_at = data.data.expires_at;
              }
            }
          } catch (error) {
            logger.error("Token refresh error:", error);
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Add custom fields to session
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.first_name = token.first_name as string;
        session.user.last_name = token.last_name as string;
        session.user.email = token.email as string;
        session.user.created_at = token.created_at as string;
        session.user.updated_at = token.updated_at as string;
        session.access_token = token.access_token as string;
        session.expires_at = token.expires_at as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
