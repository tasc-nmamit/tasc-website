"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { NAVITEM } from "@/lib/data/NavbarItems";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import SignInButton from "@/components/auth/SignInButton";
import UserMenu from "@/components/auth/UserMenu";
import PillNav from "@/components/navigation/PillNav";

// Helper type to satisfy UserMenu props from session user
type UserMenuUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  isAiml: boolean;
  onboardingComplete: boolean;
};

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Filter nav items based on auth state
  const visibleNavItems = NAVITEM.filter((item) => {
    if (item.authRequired && status !== "authenticated") return false;
    if (item.aimlOnly && !session?.user?.isAiml) return false;
    if (
      item.adminOnly &&
      session?.user?.role !== "ADMIN" &&
      session?.user?.role !== "OWNER"
    )
      return false;
    return true;
  });

  const pillItems = visibleNavItems.map((item) => ({
    label: item.title,
    href: item.href,
  }));

  const rightSlot = (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      {status === "loading" ? (
        <div className="h-8 w-8 animate-pulse rounded-full bg-white/10 border border-white/20" />
      ) : session?.user ? (
        <UserMenu user={session.user as UserMenuUser} />
      ) : (
        <SignInButton />
      )}
    </div>
  );

  return (
    <header className="fixed top-4 inset-x-0 z-50 px-4 flex justify-center pointer-events-none">
      <div className="pointer-events-auto max-w-full">
        <PillNav
          logo="/NMAMITLogo.png"
          logoAlt="TASC NMAMIT"
          items={pillItems}
          activeHref={pathname}
          baseColor="#0b0715"
          pillColor="rgba(255, 255, 255, 0.07)"
          hoverCircleColor="#7c3aed"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#e2e8f0"
          rightSlot={rightSlot}
          initialLoadAnimation={true}
        />
      </div>
    </header>
  );
}
