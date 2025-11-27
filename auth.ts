import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "database",
  },

  callbacks: {
    authorized({ auth }) {
      if (!auth?.user)
        return Response.json(
          {
            status: 401,
            error: "Você precisa estar registrado para ter acesso a esta rota",
          },
          { status: 401 }
        );
      return true;
    },

    async session({ session, user }) {
      return {
        ...session,
        user: { ...session.user, id: user.id },
      };
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});
