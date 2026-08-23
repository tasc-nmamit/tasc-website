import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import AdminEventsClient from "./AdminEventsClient";

export default async function AdminEventsPage() {
  await requireAdmin();

  // Fetch all events
  const events = await db.event.findMany({
    orderBy: { date: "desc" },
    include: {
      _count: {
        select: { participants: true },
      },
    },
  });

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Event Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create events, manage registrations, and export data.
          </p>
        </div>

        <AdminEventsClient initialEvents={events} />
      </div>
    </main>
  );
}
