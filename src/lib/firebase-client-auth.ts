"use client";

import { getAuth, signInWithCustomToken } from "firebase/auth";
import { app } from "@/lib/firebase";

let pending: Promise<void> | null = null;

/**
 * Ensures the browser is signed in to Firebase Auth (via a custom token from
 * /api/firebase-token) before any Storage upload. Storage rules reject
 * unauthenticated writes, so call this right before `uploadBytes*`.
 */
export async function ensureFirebaseAuth(): Promise<void> {
  const firebaseAuth = getAuth(app);
  if (firebaseAuth.currentUser) return;

  if (!pending) {
    pending = (async () => {
      const res = await fetch("/api/firebase-token", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data.notConfigured) {
        // Service account key not added to .env yet; proceed without custom token
        console.warn("[FIREBASE_AUTH] Service account key not configured in .env. Skipping custom token.");
        return;
      }
      if (!res.ok || !data.token) {
        throw new Error(data.error || "You must be signed in to upload files.");
      }
      await signInWithCustomToken(firebaseAuth, data.token);
    })().finally(() => {
      pending = null;
    });
  }

  return pending;
}
