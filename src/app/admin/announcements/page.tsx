import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import AdminAnnouncementsClient from "./AdminAnnouncementsClient";
import Link from "next/link";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";
import { ArrowLeft } from "lucide-react";

export default async function AdminAnnouncementsPage() {
  await requireAdmin();

  const announcements = await db.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16 bg-background bg-blueprint-grid relative">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-5xl relative z-10">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>[ RETURN_TO_ADMIN_CONSOLE ]</span>
          </Link>

          <TechnicalLabel variant="gold" className="mb-3">
            [ MODULE_04 // BROADCAST_SYSTEM ]
          </TechnicalLabel>

          <h1 className="text-3xl md:text-5xl font-bold font-space-grotesk text-foreground">
            Announcements <span className="text-gold">Management</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground font-space-grotesk">
            Broadcast official updates, workshop schedules, competition notices, and circulars.
          </p>
        </div>

        <AdminAnnouncementsClient initialAnnouncements={announcements} />
      </div>
    </main>
  );
}
