import { requireAiml } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import NoticeBoardClient, { NoticeItem } from "@/components/announcements/NoticeBoardClient";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  await requireAiml();

  const [announcementsFromDb, eventsFromDb, formsFromDb] = await Promise.all([
    db.announcement.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { name: true, image: true, role: true },
        },
      },
    }),
    db.event.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
      take: 20,
    }),
    db.form.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const now = new Date();

  // Map announcements
  const announcementNotices: NoticeItem[] = announcementsFromDb.map((a) => ({
    id: `announcement-${a.id}`,
    type: "ANNOUNCEMENT",
    title: a.title,
    content: a.content,
    date: a.createdAt,
    badge: "[ OFFICIAL_BULLETIN ]",
    badgeVariant: "primary",
    author: {
      name: a.author.name,
      image: a.author.image,
      role: a.author.role,
    },
  }));

  // Map events
  const eventNotices: NoticeItem[] = [];
  eventsFromDb.forEach((e) => {
    let eventDateTime = new Date(e.date);
    if (e.time) {
      const [h, m] = e.time.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) eventDateTime.setHours(h, m, 0, 0);
    }
    const endDateTime = e.endDate ? new Date(e.endDate) : new Date(eventDateTime.getTime() + 3 * 3600000);
    const isLive = now >= eventDateTime && now <= endDateTime;
    const isCompleted = now > endDateTime;

    // If event is upcoming or live, add Event Notice
    if (!isCompleted || isLive) {
      eventNotices.push({
        id: `event-${e.id}`,
        type: "EVENT",
        title: `${e.title}`,
        content: e.description ? e.description.replace(/<[^>]*>?/gm, "").trim().slice(0, 200) + "..." : null,
        date: e.date,
        badge: isLive ? "[ LIVE_EVENT_ALERT ]" : "[ UPCOMING_EVENT ]",
        badgeVariant: isLive ? "primary" : "gold",
        link: `/events/${e.id}`,
        linkText: isLive ? "Join Live Session" : "Register / View Event",
        eventMeta: {
          date: e.date,
          venue: e.venue,
          image: e.image,
          type: e.type,
          isLive,
          isCompleted,
        },
      });
    }

    // If event has gallery published, add Gallery Showcase Notice!
    const hasGallery = Array.isArray(e.guests) && e.guests.length > 0;
    const isGalleryPublished = e.notification === "GALLERY_PUBLISHED";

    if (hasGallery && isGalleryPublished) {
      eventNotices.push({
        id: `gallery-${e.id}`,
        type: "GALLERY",
        title: `Event Gallery: ${e.title}`,
        content: `Check out the captured moments and highlight reel from ${e.title}. Click any image to view high-resolution photos.`,
        date: e.date,
        badge: "[ EVENT_PHOTO_GALLERY ]",
        badgeVariant: "gold",
        link: `/events/${e.id}`,
        linkText: "Event Info",
        eventMeta: {
          date: e.date,
          venue: e.venue,
          photos: e.guests,
          isCompleted: true,
        },
      });
    }
  });

  // Map forms
  const formNotices: NoticeItem[] = formsFromDb.map((f) => ({
    id: `form-${f.id}`,
    type: "FORM",
    title: `Active Form: ${f.title}`,
    content: f.description ? f.description.slice(0, 180) + "..." : "New department response form open for submissions.",
    date: f.createdAt,
    badge: "[ ACTIVE_FORM_POLL ]",
    badgeVariant: "muted",
    link: `/forms/${f.id}`,
    linkText: "Fill Response",
    formMeta: {
      endTime: f.endTime,
    },
  }));

  // Merge and sort chronologically (most recent first)
  const allNotices = [...announcementNotices, ...eventNotices, ...formNotices].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <main className="min-h-dvh px-4 pt-28 pb-20 relative bg-background bg-blueprint-grid text-foreground overflow-x-hidden">
      {/* Top ambient glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 via-brand/5 to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-4xl space-y-8">
        {/* Header Section */}
        <div className="relative border border-brand/25 bg-card/85 backdrop-blur-xl p-6 sm:p-8 rounded-xl space-y-4 shadow-xl">
          <CircuitTrace corners={true} />

          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
            <TechnicalLabel variant="primary">[ DEPARTMENT_DISPATCH // CENTRAL_BOARD ]</TechnicalLabel>
            <div className="text-xs font-mono-tech text-gold bg-gold/10 border border-gold/30 px-3 py-1 rounded">
              BROADCAST_STATUS: ACTIVE
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight font-space-grotesk">
              Notice Board
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-space-grotesk">
              Department updates, newly published events, active voting forms, and highlight photo galleries from completed events.
            </p>
          </div>
        </div>

        {/* Notice Board Feed Component */}
        <NoticeBoardClient initialNotices={allNotices} />
      </div>
    </main>
  );
}
