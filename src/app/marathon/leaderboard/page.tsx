import { requireAiml } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeftIcon, TrophyIcon } from "lucide-react";
import LeaderboardPodium, { PodiumUser } from "@/components/marathon/LeaderboardPodium";
import CircularLeaderboard, { LeaderboardStudent } from "@/components/marathon/CircularLeaderboard";
import Scanner from "@/components/background/Scanner";

export default async function MarathonLeaderboard() {
  const session = await requireAiml();

  // Fetch top users sorted by score, then streak
  const rawUsers = await db.user.findMany({
    where: {
      isAiml: true,
      marathonTotalScore: { gt: 0 }, // Only show people with points
    },
    select: {
      id: true,
      name: true,
      usn: true,
      marathonTotalScore: true,
      marathonStreak: true,
      image: true,
    },
    orderBy: [
      { marathonTotalScore: "desc" },
      { marathonStreak: "desc" },
    ],
    take: 100, // Limit to top 100
  });

  const students: LeaderboardStudent[] = rawUsers.map((user, idx) => ({
    ...user,
    rank: idx + 1,
  }));

  const top3Users: PodiumUser[] = students.slice(0, 3);

  return (
    <main className="min-h-dvh px-4 pt-28 pb-20 relative bg-transparent text-slate-100">
      <div className="relative z-10 mx-auto max-w-5xl space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/marathon"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to Marathon</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/15 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                COMPETITION STANDINGS
              </span>
              <h1 className="mt-1 font-valley text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                Global Leaderboard
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Official standings verified across all daily algorithmic challenges and weekly engineering sprints.
              </p>
            </div>

            <div className="text-left md:text-right shrink-0 bg-black/60 border border-white/20 px-5 py-2.5 rounded-full">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                TOTAL PARTICIPANTS
              </span>
              <span className="font-sans text-2xl font-bold text-white">
                {students.length}
              </span>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {students.length === 0 ? (
          <div className="rounded-none border border-white/20 bg-black/75 backdrop-blur-md p-16 text-center text-slate-400">
            <TrophyIcon className="h-10 w-10 mx-auto text-white mb-3" />
            <h3 className="font-sans text-lg font-bold text-white">
              No contest scores recorded yet
            </h3>
            <p className="mt-2 text-sm max-w-md mx-auto">
              The competition leaderboard will update automatically as soon as students complete their first challenge.
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Visual Podium */}
            {top3Users.length > 0 && (
              <section>
                <LeaderboardPodium
                  topUsers={top3Users}
                  currentUserId={session.user.id}
                />
              </section>
            )}

            {/* Circular Grid Leaderboard with Interactive Profile View on Click */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="font-valley text-xl font-bold text-white">
                  Rankings Directory
                </h2>
                <span className="text-xs text-slate-400">
                  Click any circle to view complete profile
                </span>
              </div>

              <CircularLeaderboard
                students={students}
                currentUserId={session.user.id}
              />
            </section>
          </>
        )}

      </div>
    </main>
  );
}
