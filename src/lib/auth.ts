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
      allowDangerousEmailAccountLinking: true,
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
    async signIn({ user, profile }) {
      const email = user?.email || (profile as { email?: string })?.email;
      if (!email) return false;
      const normalizedEmail = email.toLowerCase().trim();
      const allowed = isAllowedEmail(normalizedEmail);
      if (!allowed) return false;

      // If allowed external email, ensure role is USER and onboarding is marked complete
      if (ALLOWED_EXTERNAL_EMAILS.has(normalizedEmail)) {
        try {
          await db.user.updateMany({
            where: { email: normalizedEmail },
            data: {
              role: "USER",
              onboardingComplete: true,
            },
          });
        } catch {
          // ignore if user not created yet
        }
      }

      return true;
    },

    /**
     * Attach user role and profile fields to the session.
     */
    async session({ session, user }) {
      if (session.user) {
        let dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            usn: true,
            role: true,
            isAiml: true,
            year: true,
            branch: true,
            onboardingComplete: true,
          },
        });

        if (dbUser) {
          // If usn is missing and email is nmamit, derive it and persist
          if (!dbUser.usn && dbUser.email && isNmamitEmail(dbUser.email)) {
            const derivedUsn = dbUser.email.split("@")[0].toUpperCase();
            const parsed = parseNmamitEmail(dbUser.email);
            await db.user.update({
              where: { id: dbUser.id },
              data: {
                usn: derivedUsn,
                ...(parsed?.isAiml ? { isAiml: true } : {}),
                ...(parsed?.branch && !dbUser.branch ? { branch: parsed.branch } : {}),
                ...(parsed?.currentYear && !dbUser.year ? { year: parsed.currentYear } : {}),
              },
            });
            dbUser.usn = derivedUsn;
            if (parsed?.isAiml) dbUser.isAiml = true;
          }

          session.user.id = dbUser.id;
          session.user.usn = dbUser.usn;
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
    async linkAccount({ user }) {
      if (user.email) {
        const email = user.email.toLowerCase().trim();
        if (ALLOWED_EXTERNAL_EMAILS.has(email)) {
          await db.user.updateMany({
            where: { email },
            data: {
              role: "USER",
              onboardingComplete: true,
            },
          });
        }
      }
    },
    /**
     * On first sign-up, parse the email to derive branch/year/AIML status and USN
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
            usn: "NNM24AM045",
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
        const derivedUsn = email.split("@")[0].toUpperCase();
        if (parsed) {
          await db.user.update({
            where: { id: user.id },
            data: {
              usn: derivedUsn,
              branch: parsed.branch,
              year: parsed.currentYear,
              isAiml: parsed.isAiml,
              isLateral: parsed.isLateral,
              role: "USER",
            },
          });
        } else {
          await db.user.update({
            where: { id: user.id },
            data: {
              usn: derivedUsn,
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
