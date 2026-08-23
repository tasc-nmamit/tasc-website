import { requireAiml } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import { format, isToday, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";

export default async function MarathonDashboard() {
  const session = await requireAiml();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  const targetYear = user?.year || 2; // Default to 2 if not set

  if (targetYear >= 4) {
    return (
      <main className="min-h-dvh px-4 pt-28 pb-16 flex items-center justify-center">
        <div className="text-center bg-red-500/10 p-12 rounded-2xl border border-red-500/20 max-w-xl">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Marathon Unavailable</h1>
          <p className="text-muted-foreground">
            The Coding Marathon is currently only available for 2nd and 3rd year students. Focus on your placements and projects!
          </p>
        </div>
      </main>
    );
  }

  const now = new Date();

  // Fetch all daily contests for this month for the calendar
  const startMonth = startOfMonth(now);
  const endMonth = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: startMonth, end: endMonth });

  const monthlyDailyContests = await db.marathonDailyContest.findMany({
    where: {
      targetYear,
      date: {
        gte: startMonth,
        lte: endMonth
      }
    },
    orderBy: { date: "asc" }
  });

  // Fetch Today's Daily Contest
  const todayContest = await db.marathonDailyContest.findFirst({
    where: {
      targetYear,
      date: { lte: now }
    },
    orderBy: { date: "desc" },
    include: {
      scores: {
        where: { score: { gt: 0 } },
        include: { user: { select: { name: true, usn: true, marathonStreak: true } } },
        orderBy: { score: "desc" },
        take: 10
      }
    }
  });

  // Fetch Current Active Weekly Contest
  const currentWeeklyContest = await db.marathonWeeklyContest.findFirst({
    where: {
      targetYear,
      date: { lte: now }
    },
    orderBy: { date: "desc" },
    include: {
      scores: {
        where: { score: { gt: 0 } },
        include: { user: { select: { name: true, usn: true } } },
        orderBy: { score: "desc" },
        take: 10
      }
    }
  });

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16 bg-[url('/grid-pattern.svg')] bg-fixed">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand to-purple-600 mb-2">
              TASC Coding Marathon
            </h1>
            <p className="text-lg text-muted-foreground">
              Year {targetYear} Dashboard • Daily & Weekly HackerRank Contests
            </p>
          </div>

          <div className="flex gap-4">
            <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 text-center min-w-[120px] backdrop-blur-sm">
              <p className="text-sm font-semibold text-brand mb-1">Total Score</p>
              <p className="text-3xl font-bold text-foreground">{user?.marathonTotalScore || 0}</p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center min-w-[120px] backdrop-blur-sm">
              <p className="text-sm font-semibold text-amber-500 mb-1">🔥 Streak</p>
              <p className="text-3xl font-bold text-foreground">{user?.marathonStreak || 0}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex gap-4">
          <Link href="/marathon/leaderboard" className="rounded-xl bg-muted/80 backdrop-blur-md px-6 py-3 font-semibold text-foreground transition-all hover:bg-muted border border-border/50 shadow-sm flex items-center gap-2">
            🏆 View Global Leaderboard
          </Link>
          {!user?.hackerrankUsername && (
            <Link href="/profile" className="rounded-xl bg-red-500/10 text-red-500 px-6 py-3 font-semibold transition-all hover:bg-red-500/20 border border-red-500/20 flex items-center gap-2">
              ⚠️ Link HackerRank Username to Participate
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Today's Daily Contest Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Today's Daily Contest
              </h2>
              
              {todayContest ? (
                <div className="relative overflow-hidden rounded-2xl border border-brand/30 bg-background/80 p-8 shadow-xl backdrop-blur-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                    <div>
                      <div className="text-brand font-bold mb-1">Day {todayContest.dayNumber}</div>
                      <h3 className="text-2xl font-bold text-foreground">{todayContest.title}</h3>
                    </div>
                    <a 
                      href={todayContest.link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="mt-4 sm:mt-0 inline-block rounded-xl bg-brand px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:bg-brand/90 hover:shadow-brand/25"
                    >
                      Join Contest on HackerRank
                    </a>
                  </div>
                  
                  {todayContest.description && (
                    <p className="text-muted-foreground mb-6 whitespace-pre-wrap">{todayContest.description}</p>
                  )}

                  <div className="mt-8">
                    <h4 className="font-semibold text-lg border-b border-border/50 pb-2 mb-4">Today's Leaderboard</h4>
                    {todayContest.scores.length === 0 ? (
                      <p className="text-muted-foreground text-sm italic">No scores synced yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {todayContest.scores.map((score, i) => (
                          <div key={score.id} className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border border-border/50">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-muted-foreground w-4">{i + 1}</span>
                              <div>
                                <p className="font-semibold">{score.user.name}</p>
                                <p className="text-xs text-muted-foreground">{score.user.usn}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-brand">{score.score} pts</p>
                              {score.user.marathonStreak > 0 && <p className="text-xs font-medium text-amber-500">🔥 {score.user.marathonStreak}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-border/50 bg-background/80 p-8 text-center shadow-lg backdrop-blur-xl">
                  <h3 className="text-xl font-bold mb-2">No Daily Contest Active</h3>
                  <p className="text-muted-foreground">Check back later for today's contest.</p>
                </div>
              )}
            </section>

            {/* Current Weekly Contest Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-500">★</span> Current Weekly Sprint
              </h2>
              
              {currentWeeklyContest ? (
                <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-background/80 p-8 shadow-xl backdrop-blur-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                    <div>
                      <div className="text-purple-500 font-bold mb-1">Week {currentWeeklyContest.weekNumber}</div>
                      <h3 className="text-2xl font-bold text-foreground">{currentWeeklyContest.title}</h3>
                      <p className="text-xs font-medium text-red-400 mt-1 bg-red-400/10 inline-block px-2 py-1 rounded">
                        Deadline: {new Date(currentWeeklyContest.deadline).toLocaleString()}
                      </p>
                    </div>
                    <a 
                      href={currentWeeklyContest.link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="mt-4 sm:mt-0 inline-block rounded-xl bg-purple-600 px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-purple-600/25"
                    >
                      Join Weekly Sprint
                    </a>
                  </div>
                  
                  {currentWeeklyContest.description && (
                    <p className="text-muted-foreground mb-6 whitespace-pre-wrap">{currentWeeklyContest.description}</p>
                  )}

                  <div className="mt-8">
                    <h4 className="font-semibold text-lg border-b border-border/50 pb-2 mb-4">Sprint Leaderboard</h4>
                    {currentWeeklyContest.scores.length === 0 ? (
                      <p className="text-muted-foreground text-sm italic">No scores synced yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {currentWeeklyContest.scores.map((score, i) => (
                          <div key={score.id} className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border border-border/50">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-muted-foreground w-4">{i + 1}</span>
                              <div>
                                <p className="font-semibold">{score.user.name}</p>
                                <p className="text-xs text-muted-foreground">{score.user.usn}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-purple-500">{score.score} pts</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-border/50 bg-background/80 p-8 text-center shadow-lg backdrop-blur-xl">
                  <h3 className="text-xl font-bold mb-2">No Active Weekly Sprint</h3>
                  <p className="text-muted-foreground">The next sprint will be announced soon.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Area - Calendar */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-border/50 bg-background/80 p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-4">{format(now, 'MMMM yyyy')}</h3>
              
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-2">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {/* Empty slots for start of month padding */}
                {Array.from({ length: startMonth.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {daysInMonth.map(day => {
                  const hasContest = monthlyDailyContests.some(c => 
                    c.date.getFullYear() === day.getFullYear() && 
                    c.date.getMonth() === day.getMonth() && 
                    c.date.getDate() === day.getDate()
                  );
                  const isCurrentDay = isToday(day);

                  return (
                    <div 
                      key={day.toISOString()} 
                      className={`flex aspect-square items-center justify-center rounded-lg text-sm transition-all
                        ${!isSameMonth(day, now) ? 'text-muted-foreground/30' : ''}
                        ${isCurrentDay ? 'bg-brand text-white font-bold shadow-md shadow-brand/20' : 'text-foreground'}
                        ${hasContest && !isCurrentDay ? 'border-2 border-brand/50 font-bold bg-brand/5' : ''}
                        ${!hasContest && !isCurrentDay && isSameMonth(day, now) ? 'hover:bg-muted' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 flex flex-col gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-brand"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm border-2 border-brand/50 bg-brand/5"></div>
                  <span>Contest Scheduled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
