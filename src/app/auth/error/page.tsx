"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
    AccessDenied: {
      title: "Access Denied",
      message:
        "Only @nmamit.in (students), @nitte.edu.in (faculties), or authorized external accounts are allowed. Please sign in with an authorized email.",
    },
    OAuthAccountNotLinked: {
      title: "Account Linking Error",
      message:
        "This email is already associated with an account. Please sign in with your verified provider.",
    },
    Configuration: {
      title: "Configuration Error",
      message: "There is a problem with the server configuration.",
    },
    Verification: {
      title: "Verification Error",
      message: "The verification link may have expired or already been used.",
    },
    Default: {
      title: "Authentication Error",
      message: "An error occurred during sign-in. Please try again.",
    },
  };

  const errorInfo = ERROR_MESSAGES[error || "Default"] || ERROR_MESSAGES.Default;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 bg-background bg-blueprint-grid relative overflow-x-hidden">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 via-brand/5 to-transparent pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="rounded-2xl border border-border/50 bg-background/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            {errorInfo.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {errorInfo.message}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/auth/signin"
              className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand/90"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </main>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
