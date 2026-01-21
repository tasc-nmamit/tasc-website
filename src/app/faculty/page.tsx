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
      <FacultyView faculties={faculties} />
    </div>
  );
}
