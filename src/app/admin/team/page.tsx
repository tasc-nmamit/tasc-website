import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import AdminTeamClient from "@/app/admin/team/AdminTeamClient";

export default async function AdminTeamPage() {
  await requireAdmin();

  const members = await db.core.findMany({
    orderBy: [{ year: "desc" }, { order: "asc" }],
    include: {
      User: {
        select: {
          id: true,
          name: true,
          displayName: true,
          email: true,
          image: true,
          links: {
            select: {
              instagram: true,
              linkedin: true,
              github: true,
            },
          },
        },
      },
    },
  });

  // Get distinct years
  const yearsData = await db.core.findMany({
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });
  const teamYears = yearsData.map((y) => y.year);

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Team Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage core team members across academic years.
          </p>
        </div>

        <AdminTeamClient initialMembers={members} teamYears={teamYears} />
      </div>
    </main>
  );
}
