import { requireAiml } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  TrophyIcon,
  ArrowRightIcon,
  AlertCircleIcon,
} from "lucide-react";
import WeeklySprintCard from "@/components/marathon/WeeklySprintCard";
import MarathonCalendarGrid, { CalendarContest, CalendarAttendanceRecord } from "@/components/marathon/MarathonCalendarGrid";
import MarathonAttendanceSection from "@/components/marathon/MarathonAttendanceSection";
import { getUserAttendanceStats } from "@/lib/marathon-streak";
import { getBatchForUser } from "@/lib/marathon-batches";

export default async function MarathonDashboard() {
  const session = await requireAiml();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  const currentUserBatch = user ? getBatchForUser(user) : null;
  const userIs3rdYear = currentUserBatch === "3A1" || currentUserBatch === "3A2" || user?.year === 3;
  const userTargetYear = userIs3rdYear ? 3 : 2;
  const targetYear = userTargetYear;

  // Ineligible / Restricted View for 4th Year or non-eligible students
  if (user?.year && user.year >= 4) {
    return (
      <main className="min-h-dvh px-4 pt-32 pb-20 flex items-center justify-center relative overflow-hidden bg-background bg-blueprint-grid text-foreground">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 via-brand/5 to-transparent pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-lg text-center border border-border dark:border-brand/25 bg-card/95 backdrop-blur-xl p-8 md:p-10 shadow-2xl rounded-xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center bg-brand/10 dark:bg-white/10 border border-brand/20 dark:border-white/20 text-foreground dark:text-white rounded-lg">
            <TrophyIcon className="h-7 w-7 text-brand-dark dark:text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400">
            TASC CODING MARATHON
          </span>
          <h1 className="mt-2 font-valley text-2xl md:text-3xl font-bold text-foreground dark:text-white">
            This competition is currently unavailable to you.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground dark:text-slate-300 leading-relaxed">
            The TASC Coding Marathon is currently reserved for 2nd and 3rd year AIML students. If you believe this is an error, please update your academic profile.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto bg-muted hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/20 border border-border dark:border-white/20 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground dark:text-white transition-colors rounded-lg"
            >
              Return Home
            </Link>
            <Link
              href="/profile"
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors rounded-lg"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const now = new Date();

  // Fetch all daily contests for this target year across all months
  const allDailyContests = await db.marathonDailyContest.findMany({
    where: {
      targetYear,
    },
    orderBy: { date: "asc" },
  });

  // Fetch Weekly Sprint Contests for this student's year
  const weeklyContests = await db.marathonWeeklyContest.findMany({
    where: {
      targetYear: userTargetYear,
    },
    orderBy: [
      { date: "desc" },
    ],
  });

  // Calendar contests data (includes all weekly sprints and daily contests across months)
  const calendarContests: CalendarContest[] = [
    ...weeklyContests.map((c) => ({
      id: c.id,
      title: c.title,
      date: new Date(c.date),
      deadline: c.deadline ? new Date(c.deadline) : undefined,
      type: "WEEKLY" as const,
      link: c.link,
    })),
    ...allDailyContests.map((c) => ({
      id: c.id,
      title: c.title,
      dayNumber: c.dayNumber,
      date: new Date(c.date),
      type: "DAILY" as const,
      link: c.link,
    })),
  ];

  // Fetch all AIML students with attendance records to determine user rank
  const allAimlStudentsForRanking = await db.user.findMany({
    where: {
      isAiml: true,
      role: "USER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      usn: true,
      marathonTotalScore: true,
      marathonStreak: true,
      marathonAttendance: {
        select: { present: true },
      },
    },
  });

  const mappedAimlStudents = allAimlStudentsForRanking
    .map((u) => {
      const batch = getBatchForUser(u);
      if (!batch) return null;

      const totalClasses = u.marathonAttendance?.length || 0;
      const presentClasses = u.marathonAttendance?.filter((a) => a.present).length || 0;
      const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
      const studentYear = batch === "3A1" || batch === "3A2" ? 3 : 2;

      return {
        id: u.id,
        name: u.name,
        usn: u.usn,
        batch,
        studentYear,
        marathonTotalScore: u.marathonTotalScore || 0,
        marathonStreak: u.marathonStreak || 0,
        attendancePercentage,
      };
    })
    .filter(Boolean) as {
      id: string;
      name: string | null;
      usn: string | null;
      batch: string;
      studentYear: number;
      marathonTotalScore: number;
      marathonStreak: number;
      attendancePercentage: number;
    }[];

  // Sort: 1. Weekly Points -> 2. Attendance % (tie breaker) -> 3. Streak -> 4. Name
  const sortYearStudents = (list: typeof mappedAimlStudents) => {
    list.sort((a, b) => {
      if (b.marathonTotalScore !== a.marathonTotalScore) {
        return b.marathonTotalScore - a.marathonTotalScore;
      }
      if (b.attendancePercentage !== a.attendancePercentage) {
        return b.attendancePercentage - a.attendancePercentage;
      }
      if (b.marathonStreak !== a.marathonStreak) {
        return b.marathonStreak - a.marathonStreak;
      }
      return (a.name || "").localeCompare(b.name || "");
    });
    return list;
  };

  const year2Ranked = sortYearStudents(mappedAimlStudents.filter((s) => s.studentYear === 2));
  const year3Ranked = sortYearStudents(mappedAimlStudents.filter((s) => s.studentYear === 3));

  const relevantRankedList = userTargetYear === 3 ? year3Ranked : year2Ranked;

  // Calculate Year-specific Rank for logged-in user
  const userRankIndex = user?.id ? relevantRankedList.findIndex((u) => u.id === user.id) : -1;
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

  // Fetch Attendance Statistics for current student
  const attendanceStats = user?.id ? await getUserAttendanceStats(user.id) : null;

  // Calendar attendance data (passes all recorded dates)
  const calendarAttendance: CalendarAttendanceRecord[] = (attendanceStats?.records || []).map((r: any) => ({
    id: r.id,
    classId: r.class.id,
    date: new Date(r.class.date),
    topic: r.class.topic,
    batch: r.batch,
    present: r.present,
  }));

  return (
    <main className="min-h-dvh px-4 pt-28 pb-20 relative bg-background bg-blueprint-grid overflow-x-hidden text-foreground">
      {/* Ambient background glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 via-brand/5 to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        
        {/* ========================================================================= */}
        {/* TOP HERO & PERFORMANCE METRICS */}
        {/* ========================================================================= */}
        <section className="border border-border dark:border-white/20 bg-card/90 dark:bg-black/75 backdrop-blur-md p-6 sm:p-8 shadow-sm rounded-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Competition Title */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 border border-border dark:border-white/20 bg-muted/60 dark:bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-300 rounded-lg">
                <span>YEAR {targetYear} ARENA</span>
              </div>

              <h1 className="font-valley text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground dark:text-white leading-tight">
                Compete. Solve. Climb.
              </h1>

              <p className="text-sm text-muted-foreground dark:text-slate-300 max-w-xl leading-relaxed">
                Compete in weekly engineering sprints, attend mentoring sessions, and climb the university rankings at TASC.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/marathon/leaderboard"
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors rounded-lg shadow-sm"
                >
                  <TrophyIcon className="h-4 w-4" />
                  <span>VIEW LEADERBOARD</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>

                {!user?.hackerrankUsername && (
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition-colors rounded-lg"
                  >
                    <AlertCircleIcon className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
                    <span>Link HackerRank ID to Sync</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Right: Sharp Editorial Stats (Clean 3-Column Grid without Streak) */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-2 bg-muted/40 dark:bg-black/60 border border-border dark:border-white/15 p-4 rounded-xl">
              {/* Total Points */}
              <div className="flex flex-col items-center justify-center text-center p-3 border border-border/60 dark:border-white/5 rounded-lg bg-card/50 dark:bg-black/30">
                <span className="font-sans text-xl sm:text-2xl font-extrabold text-foreground dark:text-white tracking-tight">
                  {(user?.marathonTotalScore || 0).toLocaleString()}
                </span>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400">
                  POINTS
                </span>
              </div>

              {/* Attendance */}
              <div className="flex flex-col items-center justify-center text-center p-3 border border-border/60 dark:border-white/5 rounded-lg bg-card/50 dark:bg-black/30">
                <span className="font-sans text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {attendanceStats?.percentage ?? 100}%
                </span>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400 truncate max-w-full">
                  {attendanceStats?.presentClasses ?? 0}/{attendanceStats?.totalClasses ?? 0} CLASSES
                </span>
                {attendanceStats?.batch && (
                  <span className="text-[9px] font-mono-tech font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mt-0.5">
                    BATCH {attendanceStats.batch}
                  </span>
                )}
              </div>

              {/* Year Rank */}
              <div className="flex flex-col items-center justify-center text-center p-3 border border-border/60 dark:border-white/5 rounded-lg bg-card/50 dark:bg-black/30">
                <span className="font-sans text-xl sm:text-2xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
                  {userRank ? `#${userRank}` : "—"}
                </span>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400">
                  YEAR {userTargetYear} RANK
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* MAIN CONTENT (SPLIT VIEW) */}
        {/* Left: Large Current Weekly Sprint Card */}
        {/* Right: Interactive Monthly Calendar Grid (Navigable across previous/future months) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT SIDE: Large Current/Upcoming Weekly Sprint Card */}
          <div className="lg:col-span-7 flex flex-col">
            <WeeklySprintCard contests={weeklyContests} userBatch={currentUserBatch} />
          </div>

          {/* RIGHT SIDE: Interactive Monthly Calendar Grid */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex-1 border border-border dark:border-white/20 bg-card/90 dark:bg-black/75 backdrop-blur-md p-6 shadow-sm rounded-2xl">
              <MarathonCalendarGrid
                currentDate={now}
                contests={calendarContests}
                attendance={calendarAttendance}
                userBatch={attendanceStats?.batch}
              />
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ATTENDANCE & CLASS SESSIONS (Filterable by Current & Previous Months) */}
        {/* ========================================================================= */}
        {attendanceStats && (
          <MarathonAttendanceSection
            records={attendanceStats.records}
            userBatch={attendanceStats.batch}
            overallPercentage={attendanceStats.percentage}
            overallPresent={attendanceStats.presentClasses}
            overallTotal={attendanceStats.totalClasses}
          />
        )}

      </div>
    </main>
  );
}
