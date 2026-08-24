import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from "lucide-react";
import EventRegistrationClient from "./EventRegistrationClient";
import { getSession } from "@/lib/auth-guards";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  const event = await db.event.findUnique({
    where: { id },
    include: {
      customFields: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!event) return notFound();

  let eventDateTime = new Date(event.date);
  if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      eventDateTime.setHours(hours, minutes, 0, 0);
    }
  }
  const isPast = eventDateTime < new Date();
  // Check if registered
  let isRegistered = false;
  let userTeam = null;

  if (session?.user) {
    const reg = await db.eventRegistration.findFirst({
      where: {
        userId: session.user.id,
        team: { eventId: id },
      },
      include: {
        team: true,
      },
    });
    if (reg) {
      isRegistered = true;
      userTeam = reg.team;
    }
  }

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16 relative">
      <div className="mx-auto max-w-4xl">
        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl mb-8 border border-border/50">
          <Image
            src={event.image || "/placeholder.png"}
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex gap-2 mb-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm ${
                isPast ? "bg-green-500 text-white" : "bg-brand text-white"
              }`}>
                {isPast ? "Completed" : "Upcoming"}
              </span>
              <span className="rounded-full bg-purple-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                {event.type}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-md">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="rounded-2xl border border-border/50 bg-background/80 backdrop-blur-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">About Event</h2>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border/50 bg-background/80 backdrop-blur-xl p-6 shadow-lg space-y-6">
              <h3 className="font-bold text-xl border-b border-border/50 pb-2">Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-brand/10 p-2 rounded-lg text-brand shrink-0">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Date</p>
                    <p className="font-medium">{event.date.toLocaleDateString()}</p>
                  </div>
                </div>

                {event.time && (
                  <div className="flex items-center gap-3">
                    <div className="bg-brand/10 p-2 rounded-lg text-brand shrink-0">
                      <ClockIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase">Time</p>
                      <p className="font-medium">{event.time}</p>
                    </div>
                  </div>
                )}

                {event.venue && (
                  <div className="flex items-center gap-3">
                    <div className="bg-brand/10 p-2 rounded-lg text-brand shrink-0">
                      <MapPinIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase">Venue</p>
                      <p className="font-medium">{event.venue}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="bg-brand/10 p-2 rounded-lg text-brand shrink-0">
                    <UsersIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Format</p>
                    <p className="font-medium">
                      {event.type === "SOLO" ? "Solo Participation" : `Team (${event.minTeamSize}-${event.maxTeamSize} members)`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <EventRegistrationClient
              event={event}
              session={session}
              isRegistered={isRegistered}
              userTeam={userTeam}
              isPast={isPast}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
