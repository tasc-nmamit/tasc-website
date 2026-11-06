import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

// Initialize App Check only in the browser
let appCheckInstance: any = null;
let tokenPromise: Promise<string | null> | null = null;

if (typeof window !== "undefined") {
  // Enable debug provider on localhost / local development
  if (
    process.env.NODE_ENV !== "production" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN
  ) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN =
      process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN || true;
  }

  if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    try {
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      console.warn("App Check initialization error:", err);
    }
  }
}

/**
 * Safely fetches a valid App Check token for outgoing requests (e.g. Firebase Storage),
 * deduplicating concurrent calls to avoid rate-limiting.
 */
export async function getAppCheckToken(forceRefresh = false): Promise<string | null> {
  if (typeof window === "undefined" || !appCheckInstance) {
    return null;
  }
  if (!forceRefresh && tokenPromise) {
    return tokenPromise;
  }

  tokenPromise = (async () => {
    try {
      const { getToken } = await import("firebase/app-check");
      const tokenResult = await getToken(appCheckInstance, forceRefresh);
      return tokenResult?.token || null;
    } catch (err) {
      console.warn("Could not retrieve App Check token:", err);
      return null;
    } finally {
      // Clear after 5 seconds so future requests can obtain fresh tokens when needed
      setTimeout(() => {
        tokenPromise = null;
      }, 5000);
    }
  })();

  return tokenPromise;
}

export { app, storage, appCheckInstance };

