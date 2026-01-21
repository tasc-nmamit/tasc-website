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
    <div className="min-h-screen pt-24 pb-10">
      <h1 className="text-4xl font-bold text-center mb-8">Faculty</h1>
      <FacultyView faculties={faculties} />
    </div>
  );
}
