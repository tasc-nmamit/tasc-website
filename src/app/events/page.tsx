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

  // Map Prisma result to our Event interface
  const events: Event[] = eventsData.map((e) => ({
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
  }));

  return <EventsView initialEvents={events} />;
}
