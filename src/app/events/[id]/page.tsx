import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, ShieldAlert } from "lucide-react";
import EventRegistrationClient from "./EventRegistrationClient";
import CountdownTimer from "./CountdownTimer";
import { getSession } from "@/lib/auth-guards";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";
import EventPhotoGallery from "@/components/events/EventPhotoGallery";

interface PageProps {
  params: Promise<{ id: string }>;
}

function isHtml(str?: string | null) {
  if (!str) return false;
  return /<[a-z][\s\S]*>/i.test(str);
}

function sanitizeHtml(html?: string | null) {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
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

  let eventStartDateTime = new Date(event.date);
  if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      eventStartDateTime.setHours(hours, minutes, 0, 0);
    }
  }

  let eventEndDateTime: Date | null = event.endDate ? new Date(event.endDate) : null;
  if (!eventEndDateTime) {
    // Default to 3 hours after start time if end time wasn't specified
    eventEndDateTime = new Date(eventStartDateTime.getTime() + 3 * 60 * 60 * 1000);
  }

  const now = new Date();
  const isUpcoming = now < eventStartDateTime;
  const isLive = now >= eventStartDateTime && now <= eventEndDateTime;
  const isPast = now > eventEndDateTime;
  
  let isRegistered = false;
  let userTeam = null;

  if (session?.user) {
    const reg = await db.eventRegistration.findFirst({
      where: {
        userId: session.user.id,
        team: { eventId: id },
      },
      include: {
        team: {
          include: {
            registrations: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (reg) {
      isRegistered = true;
      userTeam = reg.team;
    }
  }

  return (
    <main className="min-h-dvh pt-28 pb-20 relative bg-background bg-blueprint-grid overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 via-brand/5 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 relative z-10 space-y-8">
        {/* Technical Label Breadcrumb */}
        <div className="flex items-center gap-3">
          <TechnicalLabel variant="primary">[ EVENT_NODE // PROTOCOL_{event.type} ]</TechnicalLabel>
          <span className="h-px flex-1 bg-brand/20"></span>
        </div>

        {/* Hero Section: Sleek Square Technical Poster */}
        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden shadow-2xl border border-brand/30 group bg-card">
          <CircuitTrace corners={true} />

          <Image
            src={event.image || "/placeholder.png"}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050308] via-[#050308]/70 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2.5 mb-3">
                {isLive ? (
                  <span className="rounded border border-red-500/50 bg-red-500/20 px-3 py-1 text-xs font-bold font-mono-tech uppercase tracking-widest text-red-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                    LIVE NOW
                  </span>
                ) : isPast ? (
                  <span className="rounded border border-border/60 bg-muted/60 px-3 py-1 text-xs font-bold font-mono-tech uppercase tracking-widest text-muted-foreground">
                    CONCLUDED
                  </span>
                ) : (
                  <span className="rounded border border-brand-accent/50 bg-brand/20 px-3 py-1 text-xs font-bold font-mono-tech uppercase tracking-widest text-brand-accent">
                    UPCOMING
                  </span>
                )}

                <span className="rounded border border-gold/50 bg-gold/20 px-3 py-1 text-xs font-bold font-mono-tech uppercase tracking-widest text-gold">
                  FORMAT: {event.type}
                </span>

                {!event.registrationsAvailable && !isPast && (
                  <span className="rounded border border-amber-500/50 bg-amber-500/20 px-3 py-1 text-xs font-bold font-mono-tech uppercase tracking-widest text-amber-400">
                    REGISTRATION PAUSED
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold font-space-grotesk text-white drop-shadow-lg leading-tight">
                {event.title}
              </h1>
            </div>
            
            {isUpcoming && (
              <div className="shrink-0 w-full md:w-auto bg-background/60 backdrop-blur-md rounded-lg p-3 border border-brand/30">
                <CountdownTimer targetDate={eventStartDateTime} />
              </div>
            )}

            {isLive && (
              <div className="shrink-0 w-full md:w-auto bg-red-500/15 backdrop-blur-md rounded-lg p-3.5 border border-red-500/40 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
                <div>
                  <p className="text-[10px] font-mono-tech uppercase font-bold text-red-400 tracking-wider">EVENT SESSION</p>
                  <p className="text-sm font-space-grotesk text-white font-semibold">Active & Live</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content & Sidebar Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-xl border border-brand/30 bg-card/80 backdrop-blur-xl p-6 md:p-8 shadow-xl">
              <CircuitTrace corners={true} />

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="h-6 w-1.5 bg-brand-accent rounded-sm" />
                <h2 className="text-2xl font-bold font-space-grotesk text-foreground">About the Event</h2>
              </div>

              <div className="relative z-10 text-foreground font-space-grotesk leading-relaxed">
                {isHtml(event.description) ? (
                  <div
                    className="prose dark:prose-invert max-w-none text-muted-foreground text-sm md:text-base prose-headings:font-space-grotesk prose-headings:text-foreground prose-a:text-brand-accent prose-strong:text-foreground"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-muted-foreground text-sm md:text-base leading-relaxed">
                    {event.description}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info & Registration Module */}
          <div className="space-y-6">
            {/* Event Specs Card */}
            <div className="relative rounded-xl border border-brand/30 bg-card/80 backdrop-blur-xl p-6 shadow-xl">
              <CircuitTrace corners={true} />

              <h3 className="font-bold font-space-grotesk text-lg mb-6 relative z-10 flex items-center gap-2.5 text-foreground border-b border-brand/20 pb-3">
                <span className="w-6 h-6 rounded bg-brand/20 flex items-center justify-center text-brand-accent text-xs font-mono-tech">
                  #
                </span>
                Event Specifications
              </h3>
              
              <div className="space-y-5 relative z-10">
                <div className="flex gap-3.5 items-start">
                  <div className="bg-brand/10 p-2.5 rounded-lg text-brand-accent border border-brand/20 shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-mono-tech uppercase tracking-widest">Date</p>
                    <p className="font-semibold text-foreground text-sm font-space-grotesk">
                      {event.date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {event.time && (
                  <div className="flex gap-3.5 items-start">
                    <div className="bg-brand/10 p-2.5 rounded-lg text-brand-accent border border-brand/20 shrink-0">
                      <ClockIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-mono-tech uppercase tracking-widest">Time</p>
                      <p className="font-semibold text-foreground text-sm font-space-grotesk">{event.time}</p>
                    </div>
                  </div>
                )}

                {event.venue && (
                  <div className="flex gap-3.5 items-start">
                    <div className="bg-brand/10 p-2.5 rounded-lg text-brand-accent border border-brand/20 shrink-0">
                      <MapPinIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-mono-tech uppercase tracking-widest">Venue</p>
                      <p className="font-semibold text-foreground text-sm font-space-grotesk">{event.venue}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3.5 items-start">
                  <div className="bg-brand/10 p-2.5 rounded-lg text-brand-accent border border-brand/20 shrink-0">
                    <UsersIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-mono-tech uppercase tracking-widest">Team Configuration</p>
                    <p className="font-semibold text-foreground text-sm font-space-grotesk">
                      {event.type === "SOLO"
                        ? "Solo (Individual Participation)"
                        : `Team (${event.minTeamSize} to ${event.maxTeamSize} members)`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Module */}
            <EventRegistrationClient
              event={event}
              isRegistered={isRegistered}
              userTeam={userTeam}
              isPast={isPast}
              isLive={isLive}
              session={session}
            />
          </div>
        </div>

        {/* Full-Width Event Photo Gallery Showcase */}
        {event.guests && event.guests.length > 0 && (
          <EventPhotoGallery photos={event.guests} eventTitle={event.title} />
        )}
      </div>
    </main>
  );
}
