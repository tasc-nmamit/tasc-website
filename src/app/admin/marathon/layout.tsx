"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MarathonAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Coding Marathon Admin
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage daily and weekly coding contests and sync leaderboards.
          </p>
        </div>

        <div className="mb-6 flex gap-4 border-b border-border/50 pb-4">
          <Link
            href="/admin/marathon/daily"
            className={`px-4 py-2 font-semibold transition-colors ${
              pathname === "/admin/marathon/daily"
                ? "text-brand border-b-2 border-brand"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Daily Contests
          </Link>
          <Link
            href="/admin/marathon/weekly"
            className={`px-4 py-2 font-semibold transition-colors ${
              pathname === "/admin/marathon/weekly"
                ? "text-brand border-b-2 border-brand"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Weekly Contests
          </Link>
        </div>

        {children}
      </div>
    </main>
  );
}
