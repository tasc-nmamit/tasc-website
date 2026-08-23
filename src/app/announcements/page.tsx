import { requireAiml } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";

export default async function AnnouncementsPage() {
  const session = await requireAiml(); // Enforces AIML student or admin access

  const announcements = await db.announcement.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, image: true, role: true }
      }
    }
  });

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-bold text-blue-500 uppercase tracking-wider">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            AIML Department
          </div>
          <h1 className="text-4xl font-bold text-foreground">Announcements</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Important updates and announcements for AIML students.
          </p>
        </div>

        <div className="space-y-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="relative overflow-hidden rounded-2xl border border-border/50 bg-background/80 p-6 sm:p-8 shadow-lg backdrop-blur-xl transition-all hover:border-brand/30 hover:shadow-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {announcement.title}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-medium text-brand">
                      {announcement.author.name || "Admin"}
                    </span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(announcement.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-border/50 pt-6">
                <div className="prose prose-zinc dark:prose-invert max-w-none whitespace-pre-wrap">
                  {announcement.content}
                </div>
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground">All Caught Up</h3>
              <p className="mt-2 text-muted-foreground">There are no announcements right now.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
