import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminAuth } from "@/lib/firebase-admin";

// Simple in-memory per-user throttle (best-effort; resets on cold start)
const lastIssued = new Map<string, number>();
const MIN_INTERVAL_MS = 5_000;

/**
 * Issues a short-lived Firebase custom token for the signed-in NextAuth user.
 * Storage security rules use `request.auth.uid` and the `admin` claim from
 * this token, so anonymous visitors can no longer write to the bucket.
 */
export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const prev = lastIssued.get(userId) ?? 0;
  if (now - prev < MIN_INTERVAL_MS) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  lastIssued.set(userId, now);

  const role = session.user.role;
  const isAdmin = role === "ADMIN" || role === "OWNER";

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT_KEY is not configured", notConfigured: true },
      { status: 503 }
    );
  }

  try {
    const token = await getAdminAuth().createCustomToken(userId, { admin: isAdmin });
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("[FIREBASE_TOKEN]", error);
    return NextResponse.json({ error: "Failed to issue upload token" }, { status: 500 });
  }
}
