import { db } from "@/lib/db";
import { EventCategory } from "../../../../.generated/client";
import { EventsView } from "@/components/events/EventsView";
import { Event } from "@/lib/types/Event";

interface PageProps {
  params: Promise<{ type: string }>; // Updated for Next.js 15+ where params is a promise
}

export default async function EventsPage({ params }: PageProps) {
  const { type } = await params;
  const category = type.toUpperCase() as EventCategory;

  // Validate category to avoid invalid enum errors
  if (!Object.values(EventCategory).includes(category)) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Invalid event type
      </div>
    );
  }

  const eventsData = await db.event.findMany({
    orderBy: { date: type === "upcoming" ? "asc" : "desc" },
    where: {
      published: true,
      category: category,
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
    brief: e.brief,
    minTeamSize: e.minTeamSize,
    maxTeamSize: e.maxTeamSize,
    maxTeamCount: e.maxTeams,
    guests: e.guests,
    reportLink: e.reportLink,
  }));

  return <EventsView initialEvents={events} type={type} />;
}
