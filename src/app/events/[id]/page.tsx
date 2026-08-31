import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, ShieldAlert } from "lucide-react";
import EventRegistrationClient from "./EventRegistrationClient";
import CountdownTimer from "./CountdownTimer";
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
    <main className="min-h-dvh pt-24 pb-20 relative bg-background overflow-x-hidden">
      {/* Background elements */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-brand/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-blueprint-grid opacity-30 pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 relative z-10">
        {/* Hero Section */}
        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl mb-12 border border-brand/20 group">
          <Image
            src={event.image || "/placeholder.png"}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050308] via-[#050308]/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-3 mb-4">
                <span className={`rounded-lg px-4 py-1.5 text-xs font-bold font-mono-tech uppercase tracking-widest shadow-sm border ${
                  isPast ? "bg-red-500/20 text-red-400 border-red-500/50" : "bg-brand/20 text-brand-accent border-brand/50"
                }`}>
                  {isPast ? "Event Concluded" : "Upcoming"}
                </span>
                <span className="rounded-lg bg-gold/20 border border-gold/50 px-4 py-1.5 text-xs font-bold font-mono-tech uppercase tracking-widest text-gold shadow-sm">
                  {event.type}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold font-space-grotesk text-white drop-shadow-lg leading-tight">
                {event.title}
              </h1>
            </div>
            
            {!isPast && (
              <div className="shrink-0 w-full md:w-auto bg-background/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <CountdownTimer targetDate={eventDateTime} />
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-2 bg-brand-accent rounded-full" />
                <h2 className="text-3xl font-bold font-space-grotesk">About the Event</h2>
              </div>
              <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap font-sans">
                {event.description}
              </div>
            </section>

            {/* Additional content could go here in the future (schedule, rules, etc.) */}
          </div>

          {/* Sidebar / Info Panel */}
          <div className="space-y-8">
            <div className="rounded-3xl border border-brand/20 bg-card/60 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-3xl rounded-full" />
              
              <h3 className="font-bold font-space-grotesk text-2xl mb-8 relative z-10 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand-accent">
                  i
                </span>
                Event Details
              </h3>
              
              <div className="space-y-6 relative z-10">
                <div className="flex gap-4 items-start group">
                  <div className="bg-brand/10 p-3 rounded-xl text-brand group-hover:bg-brand/20 transition-colors shrink-0">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono-tech uppercase tracking-widest mb-1">Date</p>
                    <p className="font-medium text-foreground text-lg">{event.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                {event.time && (
                  <div className="flex gap-4 items-start group">
                    <div className="bg-brand/10 p-3 rounded-xl text-brand group-hover:bg-brand/20 transition-colors shrink-0">
                      <ClockIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-mono-tech uppercase tracking-widest mb-1">Time</p>
                      <p className="font-medium text-foreground text-lg">{event.time}</p>
                    </div>
                  </div>
                )}

                {event.venue && (
                  <div className="flex gap-4 items-start group">
                    <div className="bg-brand/10 p-3 rounded-xl text-brand group-hover:bg-brand/20 transition-colors shrink-0">
                      <MapPinIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-mono-tech uppercase tracking-widest mb-1">Venue</p>
                      <p className="font-medium text-foreground text-lg">{event.venue}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 items-start group">
                  <div className="bg-brand/10 p-3 rounded-xl text-brand group-hover:bg-brand/20 transition-colors shrink-0">
                    <UsersIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono-tech uppercase tracking-widest mb-1">Format</p>
                    <p className="font-medium text-foreground text-lg">
                      {event.type === "SOLO" ? "Solo Participation" : `Team (${event.minTeamSize}-${event.maxTeamSize} members)`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-brand/20 bg-card/60 backdrop-blur-xl p-8 shadow-2xl relative">
              <h3 className="font-bold font-space-grotesk text-2xl mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand-accent">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                Registration
              </h3>
              
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
      </div>
    </main>
  );
}
