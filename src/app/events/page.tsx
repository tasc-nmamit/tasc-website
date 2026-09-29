import { db } from "@/lib/db";
import { EventsView } from "@/components/events/EventsView";
import { Event } from "@/lib/types/Event";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function EventsPage() {
  const eventsData = await db.event.findMany({
    orderBy: { date: "desc" },
    where: {
      published: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      image: true,
      date: true,
      endDate: true,
      time: true,
      type: true,
      venue: true,
      description: true,
      brief: true,
      status: true,
      minTeamSize: true,
      maxTeamSize: true,
      maxTeams: true,
      guests: true,
      reportLink: true,
      published: true,
      registrationStartTime: true,
      registrationsAvailable: true,
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
    const isScheduled = e.registrationStartTime ? new Date() < new Date(e.registrationStartTime) : false;

    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      image: e.image,
      date: e.date,
      endDate: e.endDate,
      time: e.time,
      type: e.type,
      venue: e.venue,
      description: e.description,
      brief: e.brief,
      status: isScheduled ? "SCHEDULED" : e.status,
      minTeamSize: e.minTeamSize,
      maxTeamSize: e.maxTeamSize,
      maxTeamCount: e.maxTeams,
      guests: e.guests,
      reportLink: e.reportLink,
      published: e.published,
      registrationStartTime: e.registrationStartTime,
      registrationsAvailable: e.registrationsAvailable && !isPast && !isScheduled,
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

