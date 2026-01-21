import { db } from "@/lib/db";
import { TeamView } from "@/components/team/TeamView";
import { Member } from "@/lib/types/Member";

interface PageProps {
  params: Promise<{ year: string }>;
}

export default async function TeamPage({ params }: PageProps) {
  const { year } = await params;

  const [membersData, yearsData] = await Promise.all([
    db.core.findMany({
      where: { year: year },
      orderBy: { order: "asc" },
      include: {
        User: {
          include: {
            links: true,
          },
        },
      },
    }),
    db.core.findMany({
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    }),
  ]);

  const teamYears = yearsData.map((y) => y.year);

  const members: Member[] = membersData.map((core) => ({
    id: core.id,
    name: core.User.displayName || core.User.name || "Unknown",
    post: core.post,
    year: core.year,
    image: core.image,
    quote: core.quote,
    order: core.order,
    instagram: core.User.links?.instagram || undefined,
    linkedin: core.User.links?.linkedin || undefined,
    github: core.User.links?.github || undefined,
  }));

  // In legacy, year param like '2025' means '2025-26'.
  // We pass year and members to the view.
  return (
    <TeamView initialMembers={members} year={year} teamYears={teamYears} />
  );
}
