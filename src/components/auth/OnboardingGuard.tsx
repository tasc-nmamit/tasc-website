"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (
      session?.user &&
      session.user.isAiml &&
      !session.user.onboardingComplete &&
      pathname !== "/onboarding"
    ) {
      router.push("/onboarding");
    }
  }, [session, status, pathname, router]);

  return <>{children}</>;
}
