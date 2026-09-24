"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Smart Hide Navbar on Scroll Down, Reveal on Scroll Up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 25) {
        // At the very top, always show navbar
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // Scrolling down past threshold -> hide navbar
        setVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up -> reveal navbar
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted border border-border" />
      ) : session?.user ? (
        <UserMenu user={session.user as UserMenuUser} />
      ) : (
        <SignInButton />
      )}
    </div>
  );

  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <header
      className={`fixed top-4 inset-x-0 z-50 px-4 flex justify-center pointer-events-none transition-all duration-300 ease-in-out ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-28 opacity-0"
      }`}
    >
      <div className="pointer-events-auto max-w-full">
        <PillNav
          logo="/TASCLogo.png"
          logoAlt="TASC"
          items={pillItems}
          activeHref={pathname}
          baseColor={isDark ? "#0b0715" : "#ffffff"}
          pillColor={isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(91, 53, 160, 0.08)"}
          hoverCircleColor="#7c3aed"
          hoveredPillTextColor="#ffffff"
          pillTextColor={isDark ? "#e2e8f0" : "#1e1435"}
          rightSlot={rightSlot}
          initialLoadAnimation={true}
        />
      </div>
    </header>
  );
}
