import { db } from "@/lib/db";
import { EventsView } from "@/components/events/EventsView";
import { Event } from "@/lib/types/Event";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const eventsData = await db.event.findMany({
    orderBy: { date: "desc" },
    where: {
      published: true,
    },
  });

  const events: Event[] = eventsData.map((e) => {
    let eventDateTime = new Date(e.date);
    if (e.time) {
      const [hours, minutes] = e.time.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        eventDateTime.setHours(hours, minutes, 0, 0);
      }
    }
    const isPast = eventDateTime < new Date();

    return {
      id: e.id,
      title: e.title,
      image: e.image,
      date: e.date,
      endDate: e.endDate,
      time: e.time,
      type: e.type,
      venue: e.venue,
      description: e.description,
      status: e.status, // We need to add status here, let's update Event type if needed
      minTeamSize: e.minTeamSize,
      maxTeamSize: e.maxTeamSize,
      maxTeamCount: e.maxTeams,
      guests: e.guests,
      reportLink: e.reportLink,
      registrationsAvailable: e.registrationsAvailable && !isPast,
    };
  });

  return (
    <main className="min-h-dvh bg-background bg-blueprint-grid relative overflow-x-hidden">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 via-brand/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <EventsView initialEvents={events} />
      </div>
    </main>
  );
}
