import { requireAiml } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import { TrophyIcon, FlameIcon } from "lucide-react";

export default async function MarathonLeaderboard() {
  await requireAiml();

  // Fetch top users sorted by score, then streak
  const users = await db.user.findMany({
    where: { 
      isAiml: true,
      marathonTotalScore: { gt: 0 } // Only show people with points
    },
    select: {
      id: true,
      name: true,
      usn: true,
      marathonTotalScore: true,
      marathonStreak: true,
      image: true
    },
    orderBy: [
      { marathonTotalScore: "desc" },
      { marathonStreak: "desc" }
    ],
    take: 100 // Limit to top 100
  });

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16 bg-[url('/grid-pattern.svg')] bg-fixed">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/marathon" className="text-sm font-medium text-muted-foreground hover:text-foreground mb-4 inline-block">
            ← Back to Marathon Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <TrophyIcon className="h-10 w-10 text-yellow-500" />
            <h1 className="text-4xl font-extrabold text-foreground">Global Leaderboard</h1>
          </div>
          <p className="mt-2 text-lg text-muted-foreground">
            Top 100 AIML students in the Coding Marathon.
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-background/80 shadow-xl backdrop-blur-xl overflow-hidden">
          {users.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p className="text-xl">No scores recorded yet.</p>
              <p className="mt-2 text-sm">The leaderboard will update once participants complete their first problem!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-muted-foreground bg-muted/30">
                <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
                <div className="col-span-6 sm:col-span-7">Student</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2 text-center">Streak</div>
              </div>

              {users.map((user, index) => {
                let rankStyle = "text-muted-foreground";
                let bgStyle = "hover:bg-muted/30";
                
                if (index === 0) { rankStyle = "text-yellow-500 font-extrabold text-2xl"; bgStyle = "bg-yellow-500/5 hover:bg-yellow-500/10"; }
                else if (index === 1) { rankStyle = "text-slate-400 font-extrabold text-xl"; bgStyle = "bg-slate-500/5 hover:bg-slate-500/10"; }
                else if (index === 2) { rankStyle = "text-amber-700 font-extrabold text-xl"; bgStyle = "bg-amber-700/5 hover:bg-amber-700/10"; }

                return (
                  <div key={user.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${bgStyle}`}>
                    <div className={`col-span-2 sm:col-span-1 text-center font-bold ${rankStyle}`}>
                      #{index + 1}
                    </div>
                    
                    <div className="col-span-6 sm:col-span-7 flex flex-col justify-center">
                      <span className="font-bold text-foreground truncate">{user.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.usn || "No USN"}</span>
                    </div>

                    <div className="col-span-2 text-center font-bold text-brand text-lg">
                      {user.marathonTotalScore}
                    </div>

                    <div className="col-span-2 text-center flex justify-center items-center gap-1 font-semibold text-amber-500">
                      {user.marathonStreak > 0 ? (
                        <>
                          <FlameIcon className="h-4 w-4" />
                          {user.marathonStreak}
                        </>
                      ) : (
                        <span className="text-muted-foreground font-normal">0</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
