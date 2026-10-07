"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ZapIcon,
  TimerIcon,
  CalendarIcon,
  LockIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  TrophyIcon,
  SparklesIcon,
} from "lucide-react";
import CountdownTimer from "./CountdownTimer";

export interface WeeklyContestData {
  id: string;
  weekNumber: number;
  targetYear: number;
  targetBatch?: string | null;
  date: Date | string;
  deadline: Date | string;
  title: string;
  description?: string | null;
  link: string;
  quizLink?: string | null;
  isConfirmed?: boolean;
}

interface WeeklySprintCardProps {
  contest?: WeeklyContestData | null;
  contests?: WeeklyContestData[];
  userBatch?: string | null;
}

export default function WeeklySprintCard({
  contest,
  contests,
  userBatch,
}: WeeklySprintCardProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Consolidate contest list
  const contestList = useMemo(() => {
    if (contests && contests.length > 0) return contests;
    if (contest) return [contest];
    return [];
  }, [contest, contests]);

  // Determine initial selected contest
  const initialSelectedId = useMemo(() => {
    if (contestList.length === 0) return "";
    const currTime = new Date();

    // 1. Try to find an ongoing contest matching user's batch
    if (userBatch) {
      const liveForBatch = contestList.find(
        (c) =>
          c.targetBatch === userBatch &&
          new Date(c.date) <= currTime &&
          new Date(c.deadline) > currTime
      );
      if (liveForBatch) return liveForBatch.id;
    }

    // 2. Any ongoing contest
    const anyLive = contestList.find(
      (c) => new Date(c.date) <= currTime && new Date(c.deadline) > currTime
    );
    if (anyLive) return anyLive.id;

    // 3. Upcoming contest matching user's batch
    if (userBatch) {
      const upcomingForBatch = contestList.find(
        (c) => c.targetBatch === userBatch && new Date(c.date) > currTime
      );
      if (upcomingForBatch) return upcomingForBatch.id;
    }

    // 4. Any upcoming contest (closest start date)
    const upcoming = contestList
      .filter((c) => new Date(c.date) > currTime)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    if (upcoming) return upcoming.id;

    // 5. Default to the most recent contest
    return contestList[0].id;
  }, [contestList, userBatch]);

  const [activeContestId, setActiveContestId] = useState<string>(initialSelectedId);

  // Keep activeContestId valid if list updates
  useEffect(() => {
    if (initialSelectedId && (!activeContestId || !contestList.some((c) => c.id === activeContestId))) {
      setActiveContestId(initialSelectedId);
    }
  }, [initialSelectedId, contestList, activeContestId]);

  const activeContest = contestList.find((c) => c.id === activeContestId) || contestList[0] || null;

  if (!activeContest) {
    return (
      <div className="flex-1 border border-border dark:border-white/20 bg-card/90 dark:bg-black/75 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-1.5 border border-border dark:border-white/15 bg-muted/60 dark:bg-white/5 px-2.5 py-1 text-xs font-bold text-foreground dark:text-slate-300 rounded">
              <ZapIcon className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>WEEKLY SPRINT</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400">
              PENDING SCHEDULE
            </span>
          </div>

          <h2 className="font-valley text-2xl sm:text-3xl font-bold text-foreground dark:text-white tracking-tight">
            Weekly Engineering Sprint
          </h2>

          <p className="mt-3 text-sm text-muted-foreground dark:text-slate-300 leading-relaxed">
            Take on this week's algorithmic sprint and aptitude assessment to earn massive point rewards and boost your competitive standing.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-border dark:border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/40 dark:bg-black/60 border border-border dark:border-white/10 p-4 rounded-xl">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400 mb-1">
              <TimerIcon className="h-3.5 w-3.5" />
              <span>STATUS</span>
            </div>
            <span className="text-xs text-muted-foreground dark:text-slate-400 font-semibold">
              No contest scheduled yet. Check back soon.
            </span>
          </div>

          <button
            disabled
            className="w-full sm:w-auto bg-muted dark:bg-white/5 border border-border dark:border-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-500 cursor-not-allowed rounded-lg"
          >
            COMING SOON
          </button>
        </div>
      </div>
    );
  }

  const startDate = new Date(activeContest.date);
  const deadlineDate = new Date(activeContest.deadline);

  // Status checks in real-time
  const isFuture = mounted ? now < startDate : new Date() < startDate;
  const isLive = mounted ? now >= startDate && now < deadlineDate : false;
  const isConcluded = mounted ? now >= deadlineDate : false;

  const formattedStartDate = mounted
    ? format(startDate, "EEE, MMM d, yyyy • h:mm a")
    : startDate.toISOString();
  const formattedDeadlineDate = mounted
    ? format(deadlineDate, "EEE, MMM d, yyyy • h:mm a")
    : deadlineDate.toISOString();

  const is2ndYearContest = activeContest.targetYear === 2 || activeContest.targetBatch === "2A" || activeContest.targetBatch === "2B";

  return (
    <div className="flex-1 border border-border dark:border-white/20 bg-card/90 dark:bg-black/75 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between shadow-sm">
      <div>
        {/* MULTI-CONTEST SWITCHER (when more than 1 contest scheduled for the year) */}
        {contestList.length > 1 && (
          <div className="mb-6 pb-4 border-b border-border/80 dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400">
                Available Sprints ({contestList.length})
              </span>
              {is2ndYearContest && (
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                  2nd years can attempt both 2A & 2B sprints
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {contestList.map((c) => {
                const isSelected = c.id === activeContest.id;
                const cStart = new Date(c.date);
                const cEnd = new Date(c.deadline);
                const cLive = mounted ? now >= cStart && now < cEnd : false;
                const cFuture = mounted ? now < cStart : new Date() < cStart;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveContestId(c.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-300 shadow-sm"
                        : "border-border dark:border-white/15 bg-muted/40 dark:bg-white/5 text-muted-foreground hover:text-foreground hover:bg-muted/70"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        cLive
                          ? "bg-emerald-500 animate-pulse"
                          : cFuture
                          ? "bg-amber-500"
                          : "bg-muted-foreground/60"
                      }`}
                    />
                    <span>
                      Week {c.weekNumber}
                      {c.targetBatch ? ` • Batch ${c.targetBatch}` : ""}
                    </span>
                    {cLive && (
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        Live
                      </span>
                    )}
                    {cFuture && (
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                        Upcoming
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Header & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 border border-border dark:border-white/15 bg-muted/60 dark:bg-white/5 px-2.5 py-1 text-xs font-bold text-foreground dark:text-slate-300 rounded">
              <ZapIcon className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>WEEK {String(activeContest.weekNumber).padStart(2, "0")} SPRINT</span>
            </div>

            {/* Target Batch Badge */}
            {activeContest.targetBatch === "2A" && (
              <span className="inline-flex items-center gap-1 border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 rounded">
                BATCH 2A
              </span>
            )}
            {activeContest.targetBatch === "2B" && (
              <span className="inline-flex items-center gap-1 border border-indigo-500/40 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 rounded">
                BATCH 2B
              </span>
            )}
            {activeContest.targetBatch === "3" && (
              <span className="inline-flex items-center gap-1 border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 rounded">
                3RD YEAR
              </span>
            )}
          </div>

          {/* Contest Status Badges */}
          {isFuture && (
            <span className="inline-flex items-center gap-1.5 border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 rounded">
              <CalendarIcon className="h-3 w-3" />
              SCHEDULED IN FUTURE
            </span>
          )}

          {isLive && (
            <span className="inline-flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 rounded animate-pulse">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              LIVE NOW
            </span>
          )}

          {isConcluded && (
            <span className="inline-flex items-center gap-1.5 border border-border dark:border-white/15 bg-muted/50 dark:bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground rounded">
              <CheckCircle2Icon className="h-3 w-3 text-muted-foreground" />
              SPRINT CONCLUDED
            </span>
          )}
        </div>

        <h2 className="font-valley text-2xl sm:text-3xl font-bold text-foreground dark:text-white tracking-tight">
          {activeContest.title}
        </h2>

        <p className="mt-3 text-sm text-muted-foreground dark:text-slate-300 leading-relaxed">
          {activeContest.description ||
            "Take on this week's algorithmic sprint and aptitude assessment to earn massive point rewards and boost your competitive standing."}
        </p>

        {/* Cross-batch attempt note for 2nd years */}
        {is2ndYearContest && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <SparklesIcon className="h-3.5 w-3.5 text-purple-500 shrink-0" />
            <span>
              2nd year students are welcome to attempt sprints for both 2A and 2B batches.
            </span>
          </div>
        )}

        {/* Schedule Timing Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 font-mono-tech text-xs text-muted-foreground">
          <div className="inline-flex items-center gap-1.5 border border-border/70 dark:border-white/10 bg-muted/30 dark:bg-white/5 px-2.5 py-1 rounded">
            <span className="text-[10px] uppercase text-muted-foreground/80">Start:</span>
            <span className="font-semibold text-foreground dark:text-slate-200">{formattedStartDate}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 border border-border/70 dark:border-white/10 bg-muted/30 dark:bg-white/5 px-2.5 py-1 rounded">
            <span className="text-[10px] uppercase text-muted-foreground/80">Deadline:</span>
            <span className="font-semibold text-foreground dark:text-slate-200">{formattedDeadlineDate}</span>
          </div>
        </div>
      </div>

      {/* Bottom Area: Dedicated Horizontal Timer & Action Links */}
      <div className="mt-8 pt-6 border-t border-border dark:border-white/15 space-y-4">
        {/* Horizontal Timer Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/40 dark:bg-black/60 border border-border dark:border-white/10 p-4 sm:p-5 rounded-xl">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-1">
              {isFuture ? (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>CONTEST STARTS IN</span>
                </div>
              ) : isLive ? (
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-red-400">
                  <TimerIcon className="h-3.5 w-3.5" />
                  <span>DEADLINE COUNTDOWN</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2Icon className="h-3.5 w-3.5" />
                  <span>STATUS</span>
                </div>
              )}
            </div>

            <p className="text-xs font-mono-tech text-muted-foreground dark:text-slate-400">
              {isFuture
                ? `Opens on ${formattedStartDate}`
                : isLive
                ? `Closes on ${formattedDeadlineDate}`
                : `Concluded on ${formattedDeadlineDate}`}
            </p>
          </div>

          {/* Strictly Horizontal Countdown Timer */}
          <div className="shrink-0 overflow-x-auto pb-1 sm:pb-0">
            {isFuture ? (
              <CountdownTimer deadline={startDate} variant="amber" expiredLabel="Starting now..." />
            ) : isLive ? (
              <CountdownTimer deadline={deadlineDate} variant="red" expiredLabel="Sprint Concluded" />
            ) : (
              <div className="inline-flex items-center gap-2 border border-border/80 dark:border-white/15 bg-muted/40 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted-foreground rounded-lg">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                Sprint Concluded
              </div>
            )}
          </div>
        </div>

        {/* Informational Banner When Scheduled in Future */}
        {isFuture && (
          <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
            <LockIcon className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            <span>
              This contest is scheduled for{" "}
              <strong>{formattedStartDate}</strong>. Both the Aptitude Quiz form and HackerRank contest links will unlock automatically when the contest begins.
            </span>
          </div>
        )}

        {/* Action Buttons Row */}
        <div>
          {isFuture ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {activeContest.quizLink && (
                <button
                  type="button"
                  disabled
                  title="Quiz link unlocks at contest start"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 border border-border dark:border-white/10 bg-muted/30 dark:bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-60 cursor-not-allowed rounded-lg"
                >
                  <LockIcon className="h-3.5 w-3.5" />
                  <span>APTITUDE QUIZ (LOCKED)</span>
                </button>
              )}
              <button
                type="button"
                disabled
                title="HackerRank sprint unlocks at contest start"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 border border-border dark:border-white/10 bg-muted/30 dark:bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-60 cursor-not-allowed rounded-lg"
              >
                <LockIcon className="h-3.5 w-3.5" />
                <span>HR SPRINT (LOCKED)</span>
              </button>
            </div>
          ) : isLive ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {activeContest.quizLink && (
                <a
                  href={activeContest.quizLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 border border-emerald-500/50 bg-emerald-600/10 hover:bg-emerald-600/20 px-6 py-3 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 transition-colors rounded-lg shadow-sm"
                >
                  <span>TAKE APTITUDE QUIZ</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </a>
              )}
              <a
                href={activeContest.link}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors rounded-lg shadow-sm"
              >
                <span>JOIN HR SPRINT</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                href="/marathon/leaderboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/20 border border-border dark:border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-wider text-foreground dark:text-white transition-colors rounded-lg"
              >
                <TrophyIcon className="h-3.5 w-3.5" />
                <span>VIEW LEADERBOARD SCORES</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
