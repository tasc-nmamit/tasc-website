import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { isNmamitEmail, parseNmamitEmail } from "@/lib/email-parser";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    /**
     * Only allow sign-in from @nmamit.in emails.
     */
    async signIn({ user }) {
      if (!user.email) return false;
      return isNmamitEmail(user.email);
    },

    /**
     * Attach user role and profile fields to the session.
     */
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            role: true,
            isAiml: true,
            year: true,
            branch: true,
            onboardingComplete: true,
          },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.isAiml = dbUser.isAiml;
          session.user.year = dbUser.year;
          session.user.branch = dbUser.branch;
          session.user.onboardingComplete = dbUser.onboardingComplete;
        }
      }
      return session;
    },
  },
  events: {
    /**
     * On first sign-up, parse the email to derive branch/year/AIML status
     * and store it on the user record.
     */
    async createUser({ user }) {
      if (!user.email) return;

      const parsed = parseNmamitEmail(user.email);
      if (parsed) {
        await db.user.update({
          where: { id: user.id },
          data: {
            branch: parsed.branch,
            year: parsed.currentYear,
            isAiml: parsed.isAiml,
            isLateral: parsed.isLateral,
            role: user.email === "nnm24am045@nmamit.in" ? "OWNER" : "USER",
          },
        });
      } else if (user.email === "nnm24am045@nmamit.in") {
        await db.user.update({
          where: { id: user.id },
          data: { role: "OWNER" },
        });
      }
    },
  },
});
