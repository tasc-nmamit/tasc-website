import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/db";

// Simple in-memory per-user throttle (best-effort; resets on cold start)
const lastIssued = new Map<string, number>();
const MIN_INTERVAL_MS = 5_000;

/**
 * Issues a short-lived Firebase custom token for the signed-in NextAuth user,
 * or for an anonymous visitor submitting to a public form with allowAnonymous.
 */
export async function POST(request: Request) {
  const session = await auth();
  let userId = session?.user?.id;
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN" || role === "OWNER";

  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  // If user is not authenticated, check if this request is for a public form with allowAnonymous enabled
  if (!userId) {
    const formId = body?.formId;
    if (formId && typeof formId === "string") {
      const form = await db.form.findUnique({
        where: { id: formId },
        select: { published: true, allowAnonymous: true, startTime: true, endTime: true },
      });

      const now = new Date();
      const isOpen =
        form &&
        form.published &&
        form.allowAnonymous &&
        (!form.startTime || now >= form.startTime) &&
        (!form.endTime || now <= form.endTime);

      if (isOpen) {
        // Issue an isolated guest token for this upload session
        userId = `guest_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
      }
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const prev = lastIssued.get(userId) ?? 0;
  if (now - prev < MIN_INTERVAL_MS) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  lastIssued.set(userId, now);

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT_KEY is not configured", notConfigured: true },
      { status: 503 }
    );
  }

  try {
    const token = await getAdminAuth().createCustomToken(userId, {
      admin: isAdmin,
      guest: !session?.user?.id,
    });
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("[FIREBASE_TOKEN]", error);
    return NextResponse.json({ error: "Failed to issue upload token" }, { status: 500 });
  }
}
