import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { isAllowedEmail, isNmamitEmail, isNitteFacultyEmail, parseNmamitEmail, ALLOWED_EXTERNAL_EMAILS } from "@/lib/email-parser";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
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
     * Only allow sign-in from @nmamit.in (students), @nitte.edu.in (faculties),
     * and specifically allowed external users.
     */
    async signIn({ user }) {
      if (!user.email) return false;
      return isAllowedEmail(user.email);
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
            email: true,
            role: true,
            isAiml: true,
            year: true,
            branch: true,
            onboardingComplete: true,
          },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.email === "nnm24am045@nmamit.in" ? "OWNER" : dbUser.role;
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
      const email = user.email.toLowerCase().trim();

      if (email === "nnm24am045@nmamit.in") {
        const parsed = parseNmamitEmail(email);
        await db.user.update({
          where: { id: user.id },
          data: {
            role: "OWNER",
            branch: parsed?.branch || "AM",
            year: parsed?.currentYear || 3,
            isAiml: true,
            isLateral: parsed?.isLateral || false,
          },
        });
        return;
      }

      if (isNmamitEmail(email)) {
        const parsed = parseNmamitEmail(email);
        if (parsed) {
          await db.user.update({
            where: { id: user.id },
            data: {
              branch: parsed.branch,
              year: parsed.currentYear,
              isAiml: parsed.isAiml,
              isLateral: parsed.isLateral,
              role: "USER",
            },
          });
        }
      } else if (isNitteFacultyEmail(email)) {
        // Treat faculty as regular users
        await db.user.update({
          where: { id: user.id },
          data: {
            role: "USER",
            branch: "FACULTY",
            isAiml: false,
            onboardingComplete: true,
          },
        });
      } else if (ALLOWED_EXTERNAL_EMAILS.has(email)) {
        await db.user.update({
          where: { id: user.id },
          data: {
            role: "USER",
            onboardingComplete: true,
          },
        });
      }
    },
  },
});
