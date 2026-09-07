import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import RegistrationsClient from "./RegistrationsClient";
import { requireAdmin } from "@/lib/auth-guards";
import Link from "next/link";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";
import { ArrowLeft } from "lucide-react";

export default async function AdminEventRegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const event = await db.event.findUnique({
    where: { id },
    include: {
      customFields: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!event) return notFound();

  // Fetch all registrations/teams for this event
  const teams = await db.team.findMany({
    where: { eventId: id },
    include: {
      registrations: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  // Fetch all users to allow admin to manually add them
  const allUsers = await db.user.findMany({
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      usn: true,
      branch: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16 bg-background bg-blueprint-grid relative">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="mb-8">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>[ RETURN_TO_EVENT_OPERATIONS ]</span>
          </Link>

          <TechnicalLabel variant="gold" className="mb-3">
            [ EVENT_ROSTER // ATTENDANCE_MANAGER ]
          </TechnicalLabel>

          <h1 className="text-3xl md:text-5xl font-bold font-space-grotesk text-foreground">
            {event.title} <span className="text-gold">Registrations</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground font-space-grotesk">
            Manage participants, add or remove students manually, and view team rosters.
          </p>
        </div>

        <RegistrationsClient event={event} teams={teams} allUsers={allUsers} />
      </div>
    </main>
  );
}
