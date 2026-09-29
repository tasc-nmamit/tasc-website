import { requireAiml } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import MarathonLeaderboardTabs from "@/components/marathon/MarathonLeaderboardTabs";
import { LeaderboardStudent } from "@/components/marathon/CircularLeaderboard";
import { getBatchForUser } from "@/lib/marathon-batches";

export default async function MarathonLeaderboard() {
  const session = await requireAiml();

  // Fetch all AIML students with attendance records
  const rawUsers = await db.user.findMany({
    where: {
      isAiml: true,
      role: "USER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      usn: true,
      year: true,
      marathonTotalScore: true,
      marathonStreak: true,
      image: true,
      marathonAttendance: {
        select: { present: true },
      },
    },
  });

  const year2List: LeaderboardStudent[] = [];
  const year3List: LeaderboardStudent[] = [];

  for (const user of rawUsers) {
    const batch = getBatchForUser(user);
    if (!batch) {
      // Only include emails/students that are mapped with class batches
      continue;
    }

    const totalClasses = user.marathonAttendance?.length || 0;
    const presentClasses = user.marathonAttendance?.filter((a) => a.present).length || 0;
    const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

    const studentData: LeaderboardStudent = {
      id: user.id,
      name: user.name,
      usn: user.usn,
      marathonTotalScore: user.marathonTotalScore || 0,
      marathonStreak: user.marathonStreak || 0,
      image: user.image,
      rank: 0,
      attendancePercentage,
      batch,
    };

    if (batch === "2A" || batch === "2B") {
      year2List.push(studentData);
    } else if (batch === "3A1" || batch === "3A2") {
      year3List.push(studentData);
    }
  }

  // Sort function: 1. Weekly Points -> 2. Attendance % (tie breaker) -> 3. Streak -> 4. Name
  const sortStudents = (list: LeaderboardStudent[]) => {
    list.sort((a, b) => {
      // 1. Weekly contest points (desc)
      if (b.marathonTotalScore !== a.marathonTotalScore) {
        return b.marathonTotalScore - a.marathonTotalScore;
      }
      // 2. Attendance percentage as tie breaker (desc)
      if ((b.attendancePercentage ?? 0) !== (a.attendancePercentage ?? 0)) {
        return (b.attendancePercentage ?? 0) - (a.attendancePercentage ?? 0);
      }
      // 3. Day streak as secondary tie breaker (desc)
      if (b.marathonStreak !== a.marathonStreak) {
        return b.marathonStreak - a.marathonStreak;
      }
      // 4. Alphabetical by name
      return (a.name || "").localeCompare(b.name || "");
    });

    return list.map((user, idx) => ({
      ...user,
      rank: idx + 1,
    }));
  };

  const year2Students = sortStudents(year2List);
  const year3Students = sortStudents(year3List);

  // Default to student's year if available
  let defaultYear: "2" | "3" = "2";
  const userBatch = getBatchForUser(session.user);
  if (userBatch === "3A1" || userBatch === "3A2" || session.user.year === 3) {
    defaultYear = "3";
  }

  const totalEnrolled = year2Students.length + year3Students.length;

  return (
    <main className="min-h-dvh px-4 pt-28 pb-20 relative bg-background bg-blueprint-grid overflow-x-hidden text-foreground">
      {/* Ambient background glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 via-brand/5 to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/marathon"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to Marathon</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border dark:border-white/15 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400">
                COMPETITION STANDINGS
              </span>
              <h1 className="mt-1 font-valley text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground dark:text-white">
                Marathon Leaderboard
              </h1>
              <p className="mt-2 text-sm text-muted-foreground dark:text-slate-300">
                Independent leaderboards for 2nd and 3rd year students. Points are calculated solely from weekly engineering sprints.
              </p>
            </div>

            <div className="text-left md:text-right shrink-0 bg-card dark:bg-black/60 border border-border dark:border-white/20 px-5 py-2.5 rounded-full shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400 block">
                ENROLLED PARTICIPANTS
              </span>
              <span className="font-sans text-2xl font-bold text-foreground dark:text-white">
                {totalEnrolled}
              </span>
            </div>
          </div>
        </div>

        {/* Tabbed Year-specific Leaderboards */}
        <MarathonLeaderboardTabs
          year2Students={year2Students}
          year3Students={year3Students}
          currentUserId={session.user.id}
          defaultYear={defaultYear}
        />

      </div>
    </main>
  );
}
