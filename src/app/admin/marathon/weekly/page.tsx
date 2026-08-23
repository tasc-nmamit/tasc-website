import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import WeeklyMarathonClient from "./WeeklyMarathonClient";

export default async function AdminWeeklyMarathonPage() {
  await requireAdmin();

  const contests = await db.marathonWeeklyContest.findMany({
    orderBy: { date: "desc" },
    include: {
      _count: {
        select: { scores: true },
      },
    },
  });

  // Get AIML users grouped by year for easy filtering
  const users = await db.user.findMany({
    where: { isAiml: true },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      usn: true, 
      marathonTotalScore: true, 
      marathonStreak: true, 
      hackerrankUsername: true,
      year: true
    },
    orderBy: { marathonTotalScore: "desc" },
  });

  return <WeeklyMarathonClient initialContests={contests} aimlUsers={users} />;
}
