import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import AdminAnnouncementsClient from "./AdminAnnouncementsClient";

export default async function AdminAnnouncementsPage() {
  await requireAdmin();

  const announcements = await db.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Announcements Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Post and manage announcements exclusively for AIML students.
          </p>
        </div>

        <AdminAnnouncementsClient initialAnnouncements={announcements} />
      </div>
    </main>
  );
}
