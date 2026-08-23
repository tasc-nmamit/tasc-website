import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Role } from "@prisma";

/**
 * Requires the user to be authenticated. Redirects to sign-in if not.
 * Returns the session.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }
  return session;
}

/**
 * Requires the user to be an ADMIN or OWNER. Redirects to home if not.
 */
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== Role.ADMIN && session.user.role !== Role.OWNER) {
    redirect("/");
  }
  return session;
}

/**
 * Requires the user to be an OWNER. Redirects to home if not.
 */
export async function requireOwner() {
  const session = await requireAuth();
  if (session.user.role !== Role.OWNER) {
    redirect("/");
  }
  return session;
}

/**
 * Requires the user to be an AIML student. Redirects to home if not.
 */
export async function requireAiml() {
  const session = await requireAuth();
  if (!session.user.isAiml && session.user.role !== Role.ADMIN && session.user.role !== Role.OWNER) {
    redirect("/");
  }
  return session;
}

/**
 * Requires the user to be a marathon-eligible student (2nd or 3rd year AIML).
 */
export async function requireMarathonEligible() {
  const session = await requireAiml();
  const year = session.user.year;
  if (session.user.role !== Role.ADMIN && session.user.role !== Role.OWNER) {
    if (!year || (year !== 2 && year !== 3)) {
      redirect("/");
    }
  }
  return session;
}

/**
 * Checks if the user is an admin or owner (non-redirecting, for conditional rendering).
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === Role.ADMIN || session?.user?.role === Role.OWNER;
}

/**
 * Gets the current session without requiring auth (returns null if not authenticated).
 */
export async function getSession() {
  return await auth();
}
