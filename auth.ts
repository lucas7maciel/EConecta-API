import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  redirectProxyUrl: "http://localhost:3000/api/auth/redirect",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "google") {
        token.id = token.sub;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.sub as string,
        name: token.name as string,
        email: token.email as string,
        image: token.picture as string,
        emailVerified: token.email_verified as Date | null,
      };

      session.sessionToken = jwt.sign(
        {
          id: token.id,
          email: token.email,
          name: token.name,
        },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: "30d" }
      );

      return session;
    },

    async redirect({ url, baseUrl, ...outros }) {
      console.log("Ta passando por aqui", url, baseUrl, outros);
      const mobileCallback = encodeURIComponent("econecta://auth/callback");
      return `${baseUrl}/api/redirect?callbackUrl=${mobileCallback}`;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});
