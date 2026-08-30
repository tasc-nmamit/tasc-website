import { requireAiml } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  TrophyIcon,
  FlameIcon,
  ZapIcon,
  ArrowRightIcon,
  SparklesIcon,
  AlertCircleIcon,
  TimerIcon,
} from "lucide-react";
import CountdownTimer from "@/components/marathon/CountdownTimer";
import MarathonCalendarGrid, { CalendarContest } from "@/components/marathon/MarathonCalendarGrid";
import MarathonJourney, { JourneyDay } from "@/components/marathon/MarathonJourney";
import Scanner from "@/components/background/Scanner";
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

export default async function MarathonDashboard() {
  const session = await requireAiml();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  const targetYear = user?.year || 2; // Default to 2 if not set

  // Ineligible / Restricted View for 4th Year or non-eligible students
  if (targetYear >= 4) {
    return (
      <main className="min-h-dvh px-4 pt-32 pb-20 flex items-center justify-center relative overflow-hidden bg-slate-950">
        {/* Highlighted Background Image */}
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-80 pointer-events-none"
          style={{ backgroundImage: "url('/Marathon-bg.jpg')" }}
        />
        <div className="fixed inset-0 z-0 bg-black/50 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-lg text-center border border-white/20 bg-black/80 backdrop-blur-md p-8 md:p-10 shadow-2xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center bg-white/10 border border-white/20 text-white">
            <TrophyIcon className="h-7 w-7 text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            TASC CODING MARATHON
          </span>
          <h1 className="mt-2 font-valley text-2xl md:text-3xl font-bold text-white">
            This competition is currently unavailable to you.
          </h1>
          <p className="mt-4 text-sm text-slate-300 leading-relaxed">
            The TASC Coding Marathon is currently reserved for 2nd and 3rd year AIML students. If you believe this is an error, please update your academic profile.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors"
            >
              Return Home
            </Link>
            <Link
              href="/profile"
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const now = new Date();
  const startMonth = startOfMonth(now);
  const endMonth = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: startMonth, end: endMonth });

  // Fetch all daily contests for this month
  const monthlyDailyContests = await db.marathonDailyContest.findMany({
    where: {
      targetYear,
      date: {
        gte: startMonth,
        lte: endMonth,
      },
    },
    orderBy: { date: "asc" },
  });

  // Fetch current user's daily scores for this month
  const userMonthlyScores = user?.id
    ? await db.marathonDailyScore.findMany({
        where: {
          userId: user.id,
          contest: {
            date: {
              gte: startMonth,
              lte: endMonth,
            },
          },
        },
        select: {
          contestId: true,
          score: true,
        },
      })
    : [];

  const scoreMap = new Map(userMonthlyScores.map((s) => [s.contestId, s.score]));

  // Build Journey Timeline Data
  const journeyDays: JourneyDay[] = daysInMonth.map((day) => {
    const contest = monthlyDailyContests.find((c) => isSameDay(c.date, day));
    return {
      date: day,
      contestTitle: contest?.title,
      dayNumber: contest?.dayNumber,
      hasContest: Boolean(contest),
      score: contest ? scoreMap.get(contest.id) : undefined,
      link: contest?.link,
    };
  });

  // Calendar contests data
  const calendarContests: CalendarContest[] = monthlyDailyContests.map((c) => ({
    id: c.id,
    title: c.title,
    dayNumber: c.dayNumber,
    date: new Date(c.date),
    link: c.link,
  }));

  // Fetch Today's Daily Contest
  const todayContest = await db.marathonDailyContest.findFirst({
    where: {
      targetYear,
      date: { lte: now },
    },
    orderBy: { date: "desc" },
  });

  // Fetch Current Active Weekly Sprint Contest
  const currentWeeklyContest = await db.marathonWeeklyContest.findFirst({
    where: {
      targetYear,
      date: { lte: now },
    },
    orderBy: { date: "desc" },
  });

  // Calculate Global Rank
  const userScore = user?.marathonTotalScore || 0;
  const userRank =
    userScore > 0
      ? (await db.user.count({
          where: {
            isAiml: true,
            marathonTotalScore: { gt: userScore },
          },
        })) + 1
      : null;

  // Fetch Top 5 Performers for Preview
  const topLeaders = await db.user.findMany({
    where: {
      isAiml: true,
      marathonTotalScore: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      usn: true,
      marathonTotalScore: true,
      marathonStreak: true,
    },
    orderBy: [
      { marathonTotalScore: "desc" },
      { marathonStreak: "desc" },
    ],
    take: 5,
  });

  return (
    <main className="min-h-dvh px-4 pt-28 pb-20 relative bg-transparent text-slate-100">
      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        
        {/* ========================================================================= */}
        {/* TOP HERO & PERFORMANCE METRICS */}
        {/* ========================================================================= */}
        <section className="border border-white/20 bg-black/75 backdrop-blur-md p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Competition Title */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-300">
                <span>YEAR {targetYear} ARENA</span>
              </div>

              <h1 className="font-valley text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Compete. Solve. Climb.
              </h1>

              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Take on daily coding challenges, build your streak, and climb the university rankings at TASC.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/marathon/leaderboard"
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors"
                >
                  <TrophyIcon className="h-4 w-4" />
                  <span>VIEW LEADERBOARD</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>

                {!user?.hackerrankUsername && (
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition-colors"
                  >
                    <AlertCircleIcon className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>Link HackerRank ID to Sync</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Right: Sharp Editorial Stats */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-2 bg-black/60 border border-white/15 p-4">
              {/* Total Points */}
              <div className="flex flex-col items-center justify-center text-center p-2 border border-white/5">
                <span className="font-sans text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {(user?.marathonTotalScore || 0).toLocaleString()}
                </span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  POINTS
                </span>
              </div>

              {/* Day Streak */}
              <div className="flex flex-col items-center justify-center text-center p-2 border border-white/5">
                <div className="flex items-center gap-1">
                  <FlameIcon className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="font-sans text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
                    {user?.marathonStreak || 0}
                  </span>
                </div>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  DAY STREAK
                </span>
              </div>

              {/* Global Rank */}
              <div className="flex flex-col items-center justify-center text-center p-2 border border-white/5">
                <span className="font-sans text-2xl sm:text-3xl font-extrabold text-purple-400 tracking-tight">
                  {userRank ? `#${userRank}` : "—"}
                </span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  GLOBAL RANK
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* MAIN CONTENT (SPLIT VIEW) */}
        {/* Left: Large Current Weekly Sprint Card */}
        {/* Right: Minimalist Monthly Calendar Grid */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT SIDE: Large Current Weekly Sprint Card */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex-1 border border-white/20 bg-black/75 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between">
              
              {/* Sprint Content */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="inline-flex items-center gap-1.5 border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-300">
                    <ZapIcon className="h-3.5 w-3.5 text-purple-400" />
                    <span>
                      {currentWeeklyContest
                        ? `WEEK ${String(currentWeeklyContest.weekNumber).padStart(2, "0")} SPRINT`
                        : "WEEKLY SPRINT"}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    ACTIVE CHALLENGE
                  </span>
                </div>

                <h2 className="font-valley text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {currentWeeklyContest ? currentWeeklyContest.title : "Weekly Engineering Sprint"}
                </h2>

                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  {currentWeeklyContest?.description ||
                    "Take on this week's algorithmic sprint to earn massive point rewards and boost your competitive standing."}
                </p>
              </div>

              {/* Timer & Action Bar */}
              <div className="mt-8 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/60 border border-white/10 p-4">
                
                {/* Red Deadline Timer */}
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-400 mb-1.5">
                    <TimerIcon className="h-3.5 w-3.5" />
                    <span>DEADLINE COUNTDOWN</span>
                  </div>
                  {currentWeeklyContest ? (
                    <CountdownTimer deadline={currentWeeklyContest.deadline} variant="red" />
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold">
                      Sprint launching soon
                    </span>
                  )}
                </div>

                {/* Sharp "Join Sprint" Button */}
                {currentWeeklyContest ? (
                  <a
                    href={currentWeeklyContest.link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors shrink-0"
                  >
                    <span>JOIN SPRINT</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full sm:w-auto bg-white/5 border border-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-not-allowed"
                  >
                    COMING SOON
                  </button>
                )}

              </div>

            </div>
          </div>

          {/* RIGHT SIDE: Minimalist Monthly Calendar Grid */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex-1 border border-white/20 bg-black/75 backdrop-blur-md p-6">
              <MarathonCalendarGrid
                currentDate={now}
                startMonth={startMonth}
                daysInMonth={daysInMonth}
                contests={calendarContests}
              />
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* TODAY'S DAILY CHALLENGE */}
        {/* ========================================================================= */}
        {todayContest && (
          <section className="border border-white/20 bg-black/75 backdrop-blur-md p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    TODAY&apos;S DAILY CHALLENGE • DAY {todayContest.dayNumber}
                  </span>
                </div>

                <h3 className="font-valley text-xl sm:text-2xl font-bold text-white">
                  {todayContest.title}
                </h3>

                {todayContest.description && (
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {todayContest.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    REWARD
                  </span>
                  <span className="font-sans text-base font-bold text-white">
                    +100 PTS
                  </span>
                </div>

                <a
                  href={todayContest.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors"
                >
                  <span>SOLVE TODAY</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ACTIVITY TIMELINE / MARATHON JOURNEY */}
        {/* ========================================================================= */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="font-valley text-xl sm:text-2xl font-bold tracking-tight text-white">
                Marathon Journey
              </h2>
              <p className="text-xs text-slate-400">
                Track your active streaks, solved problems, and upcoming contests across the month.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 sm:pt-0">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-purple-500" /> Solved
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-emerald-500" /> Live
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 border border-white/40" /> Scheduled
              </span>
            </div>
          </div>

          <div className="border border-white/20 bg-black/75 backdrop-blur-md p-5">
            <MarathonJourney days={journeyDays} />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* LIVE RANKINGS STANDINGS PREVIEW */}
        {/* ========================================================================= */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                STANDINGS
              </span>
              <h2 className="font-valley text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                Who&apos;s Leading?
              </h2>
            </div>

            <Link
              href="/marathon/leaderboard"
              className="inline-flex items-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors shrink-0"
            >
              <span>VIEW FULL LEADERBOARD</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          {topLeaders.length === 0 ? (
            <div className="border border-white/15 bg-black/60 p-8 text-center text-slate-400 text-sm">
              No scores recorded yet. Complete today&apos;s contest to claim the top spot!
            </div>
          ) : (
            <div className="border border-white/20 bg-black/75 backdrop-blur-md overflow-hidden divide-y divide-white/10">
              {topLeaders.map((leader, index) => {
                const isCurrentUser = leader.id === user?.id;
                const isTop3 = index < 3;
                const medals = ["🥇", "🥈", "🥉"];

                return (
                  <div
                    key={leader.id}
                    className={`flex items-center justify-between p-4 transition-colors ${
                      isCurrentUser
                        ? "bg-purple-600/15 border-l-4 border-l-purple-500"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {/* Rank & User Info */}
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                      <div className="flex h-7 w-7 rounded-full items-center justify-center bg-white/10 border border-white/15 font-sans font-bold text-xs text-white shrink-0">
                        {isTop3 ? (
                          <span>{medals[index]}</span>
                        ) : (
                          index + 1
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-bold text-white truncate text-sm sm:text-base">
                            {leader.name}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-bold text-purple-400 shrink-0 uppercase tracking-wider">
                              (YOU)
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 truncate block">
                          {leader.usn || "AIML STUDENT"}
                        </span>
                      </div>
                    </div>

                    {/* Score & Streak */}
                    <div className="flex items-center gap-6 sm:gap-8 shrink-0 text-right">
                      <div className="flex items-center gap-1 font-sans text-xs sm:text-sm font-semibold text-amber-400">
                        <FlameIcon className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>{leader.marathonStreak}d</span>
                      </div>

                      <div>
                        <span className="font-sans text-sm sm:text-base font-extrabold text-white">
                          {leader.marathonTotalScore.toLocaleString()}
                        </span>
                        <span className="hidden sm:inline text-[10px] font-bold text-slate-400 uppercase ml-1">
                          pts
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
