import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import DailyMarathonClient from "./DailyMarathonClient";

export default async function AdminDailyMarathonPage() {
  await requireAdmin();

  const contests = await db.marathonDailyContest.findMany({
    orderBy: { date: "desc" },
    include: {
      _count: {
        select: { scores: true },
      },
    },
  });

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

  return <DailyMarathonClient initialContests={contests} aimlUsers={users} />;
}
