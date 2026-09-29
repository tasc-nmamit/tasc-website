"use client";

import { useState } from "react";
import LeaderboardPodium, { PodiumUser } from "@/components/marathon/LeaderboardPodium";
import CircularLeaderboard, { LeaderboardStudent } from "@/components/marathon/CircularLeaderboard";
import { TrophyIcon, UsersIcon, ShieldCheckIcon } from "lucide-react";

interface MarathonLeaderboardTabsProps {
  year2Students: LeaderboardStudent[];
  year3Students: LeaderboardStudent[];
  currentUserId?: string;
  defaultYear?: "2" | "3";
}

export default function MarathonLeaderboardTabs({
  year2Students,
  year3Students,
  currentUserId,
  defaultYear = "2",
}: MarathonLeaderboardTabsProps) {
  const [activeYear, setActiveYear] = useState<"2" | "3">(defaultYear);

  const activeStudents = activeYear === "2" ? year2Students : year3Students;
  const top3Users: PodiumUser[] = activeStudents.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Year Selection Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => setActiveYear("2")}
          className={`flex-1 w-full py-3.5 px-6 rounded-xl border text-sm font-bold transition-all duration-200 cursor-pointer flex flex-col items-center gap-1 ${
            activeYear === "2"
              ? "bg-brand/20 border-brand-accent text-foreground shadow-lg shadow-brand/10 scale-102"
              : "bg-card/60 border-brand/20 text-muted-foreground hover:text-foreground hover:bg-card/90 hover:border-brand/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-brand-accent" />
            <span className="font-space-grotesk text-base">2nd Year Leaderboard</span>
          </div>
          <span className="text-[11px] font-mono-tech text-muted-foreground">
            Batch 2A & 2B • {year2Students.length} Students
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveYear("3")}
          className={`flex-1 w-full py-3.5 px-6 rounded-xl border text-sm font-bold transition-all duration-200 cursor-pointer flex flex-col items-center gap-1 ${
            activeYear === "3"
              ? "bg-brand/20 border-brand-accent text-foreground shadow-lg shadow-brand/10 scale-102"
              : "bg-card/60 border-brand/20 text-muted-foreground hover:text-foreground hover:bg-card/90 hover:border-brand/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-brand-accent" />
            <span className="font-space-grotesk text-base">3rd Year Leaderboard</span>
          </div>
          <span className="text-[11px] font-mono-tech text-muted-foreground">
            Batch 3A1 & 3A2 • {year3Students.length} Students
          </span>
        </button>
      </div>

      {/* Rules & Tie-breaker Notice */}
      <div className="max-w-2xl mx-auto bg-card/40 border border-brand/20 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-center text-xs font-mono-tech text-muted-foreground">
        <ShieldCheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          Points are based exclusively on weekly engineering sprints. Class attendance percentage acts as the primary tie-breaker.
        </span>
      </div>

      {/* Empty State */}
      {activeStudents.length === 0 ? (
        <div className="rounded-xl border border-brand/20 bg-card/60 backdrop-blur-md p-16 text-center text-muted-foreground shadow-sm max-w-xl mx-auto">
          <TrophyIcon className="h-10 w-10 mx-auto text-brand-accent mb-3" />
          <h3 className="font-space-grotesk text-lg font-bold text-foreground">
            No {activeYear === "2" ? "2nd" : "3rd"} Year students enrolled
          </h3>
          <p className="mt-2 text-sm">
            Enrolled class students for Batch {activeYear === "2" ? "2A & 2B" : "3A1 & 3A2"} will appear here automatically.
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Visual Podium */}
          {top3Users.length > 0 && (
            <section>
              <LeaderboardPodium topUsers={top3Users} currentUserId={currentUserId} />
            </section>
          )}

          {/* Directory Grid with Search & Student Profile Modal */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-valley text-xl font-bold text-foreground">
                {activeYear === "2" ? "2nd Year" : "3rd Year"} Rankings Directory
              </h2>
              <span className="text-xs font-mono-tech text-muted-foreground">
                {activeStudents.length} Enrolled Students
              </span>
            </div>

            <CircularLeaderboard
              students={activeStudents}
              currentUserId={currentUserId}
            />
          </section>
        </>
      )}
    </div>
  );
}
