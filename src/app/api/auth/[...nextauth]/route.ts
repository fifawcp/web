import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        access_token: { label: "Access Token", type: "text" },
        expires_at: { label: "Expires At", type: "text" },
        user: { label: "User Data", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        const creds = credentials as Record<string, string>;

        // OTP was already verified by backend, just create session
        const user = JSON.parse(creds.user);

        return {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
          access_token: creds.access_token,
          expires_at: creds.expires_at,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
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
      if (trigger === "update" && session?.access_token) {
        token.access_token = session.access_token;
        token.expires_at = session.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
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
