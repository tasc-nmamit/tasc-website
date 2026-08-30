import { requireAiml } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import LinkedListTimeline, { AnnouncementItem } from "@/components/announcements/LinkedListTimeline";

export default async function AnnouncementsPage() {
  await requireAiml();

  const announcementsFromDb = await db.announcement.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, image: true, role: true },
      },
    },
  });

  const announcements: AnnouncementItem[] = announcementsFromDb.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    createdAt: a.createdAt,
    author: {
      name: a.author.name,
      image: a.author.image,
      role: a.author.role,
    },
  }));

  return (
    <main className="min-h-dvh px-4 pt-28 pb-20 relative bg-transparent text-slate-100">
      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-4xl space-y-8">
        
        {/* Header Section */}
        <div className="border border-white/20 bg-black/75 backdrop-blur-md p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-300">
              <span>BROADCAST FEED</span>
            </div>

            {/* Subtle DSA Linked List Header Badge */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-purple-300 bg-purple-950/80 border border-purple-500/40 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              <span className="font-bold">LATEST → HEAD</span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Announcements
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Stay updated with the latest from TASC. Official circulars, competition alerts, and departmental news.
            </p>
          </div>
        </div>

        {/* Linked List / Git Commit Timeline */}
        <section>
          <LinkedListTimeline announcements={announcements} />
        </section>

      </div>
    </main>
  );
}
