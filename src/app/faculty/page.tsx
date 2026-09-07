import FacultyView from "@/components/faculty/FacultyView";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FacultyPage() {
  const faculties = await db.faculty.findMany({
    where: {
      published: true,
    },
    orderBy: {
      order: "asc",
    },
  });

  return (
    <main className="min-h-dvh pt-28 pb-16 bg-background bg-blueprint-grid relative overflow-x-hidden">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/10 via-brand/5 to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <FacultyView faculties={faculties} />
      </div>
    </main>
  );
}
