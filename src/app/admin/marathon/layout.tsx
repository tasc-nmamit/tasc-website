"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";
import { ArrowLeft, CodeIcon, CalendarIcon, UsersIcon } from "lucide-react";

export default function MarathonAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16 bg-background bg-blueprint-grid relative">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>[ RETURN_TO_ADMIN_CONSOLE ]</span>
          </Link>

          <TechnicalLabel variant="gold" className="mb-3">
            [ MODULE_05 // COMPETITION_CORE ]
          </TechnicalLabel>

          <h1 className="text-3xl md:text-5xl font-bold font-space-grotesk text-foreground">
            Coding Marathon <span className="text-gold">Administration</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground font-space-grotesk">
            Manage daily practice sprints, weekly marathon challenges, class scheduling, and attendance tracking.
          </p>
        </div>

        {/* Unified Navigation Tabs */}
        <div className="mb-8 flex flex-wrap gap-3 border-b border-brand/20 pb-4">
          <Link
            href="/admin/marathon/daily"
            className={`px-5 py-2.5 rounded-xl font-space-grotesk font-semibold text-sm transition-all flex items-center gap-2 ${
              pathname === "/admin/marathon/daily"
                ? "bg-brand/20 text-brand-accent border border-brand/40 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card/40"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Daily Sprints (5:30 AM)
          </Link>
          <Link
            href="/admin/marathon/weekly"
            className={`px-5 py-2.5 rounded-xl font-space-grotesk font-semibold text-sm transition-all flex items-center gap-2 ${
              pathname === "/admin/marathon/weekly"
                ? "bg-brand/20 text-brand-accent border border-brand/40 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card/40"
            }`}
          >
            <CodeIcon className="w-4 h-4" />
            Weekly Challenges
          </Link>
          <Link
            href="/admin/marathon/attendance"
            className={`px-5 py-2.5 rounded-xl font-space-grotesk font-semibold text-sm transition-all flex items-center gap-2 ${
              pathname === "/admin/marathon/attendance"
                ? "bg-brand/20 text-brand-accent border border-brand/40 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card/40"
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            Class Attendance
          </Link>
        </div>

        {children}
      </div>
    </main>
  );
}
