"use client";

import { useState, useEffect, useMemo } from "react";
import {
  SearchIcon,
  XIcon,
  LayoutListIcon,
  LayoutGridIcon,
  TrophyIcon,
  UserIcon,
  CheckCircle2Icon,
  FilterIcon,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import ClientPortal from "@/components/ui/ClientPortal";

export interface LeaderboardStudent {
  id: string;
  name: string | null;
  usn: string | null;
  marathonTotalScore: number;
  marathonStreak?: number;
  image?: string | null;
  rank: number;
  attendancePercentage?: number;
  batch?: string;
}

interface CircularLeaderboardProps {
  students: LeaderboardStudent[];
  currentUserId?: string;
}

export default function CircularLeaderboard({
  students,
  currentUserId,
}: CircularLeaderboardProps) {
  const [selectedStudent, setSelectedStudent] = useState<LeaderboardStudent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Prevent scroll when modal is open
  useEffect(() => {
    if (selectedStudent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedStudent]);

  // Extract unique batches from students
  const availableBatches = useMemo(() => {
    const batches = new Set<string>();
    students.forEach((s) => {
      if (s.batch) batches.add(s.batch);
    });
    return Array.from(batches).sort();
  }, [students]);

  // Filter students based on search query and batch
  const filteredStudents = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return students.filter((s) => {
      const matchesBatch = selectedBatch === "ALL" || s.batch === selectedBatch;
      if (!matchesBatch) return false;

      if (!query) return true;
      return (
        (s.name && s.name.toLowerCase().includes(query)) ||
        (s.usn && s.usn.toLowerCase().includes(query))
      );
    });
  }, [students, searchQuery, selectedBatch]);

  // Current user standing
  const currentUserRecord = useMemo(() => {
    return currentUserId ? students.find((s) => s.id === currentUserId) : null;
  }, [students, currentUserId]);

  return (
    <div className="space-y-6">
      {/* Current User Quick Standing Banner */}
      {currentUserRecord && (
        <div className="border border-purple-500/40 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center font-bold text-sm text-purple-600 dark:text-purple-300">
              #{currentUserRecord.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  YOUR CURRENT STANDING
                </span>
                <span className="text-[10px] font-mono-tech px-2 py-0.2 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold">
                  Batch {currentUserRecord.batch}
                </span>
              </div>
              <p className="text-sm font-bold text-foreground dark:text-white">
                {currentUserRecord.name} ({currentUserRecord.usn || "AIML"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] font-mono-tech text-muted-foreground uppercase block">
                Total Score
              </span>
              <span className="font-extrabold text-foreground dark:text-white text-base">
                {currentUserRecord.marathonTotalScore.toLocaleString()} pts
              </span>
            </div>

            <div className="text-right border-l border-border dark:border-white/10 pl-4">
              <span className="text-[10px] font-mono-tech text-muted-foreground uppercase block">
                Attendance
              </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                {currentUserRecord.attendancePercentage ?? 0}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStudent(currentUserRecord)}
              className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ml-1"
            >
              View Card
            </button>
          </div>
        </div>
      )}

      {/* Control Bar: Search + Batch Filter Tabs + View Mode Toggle */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card/80 dark:bg-black/60 border border-border dark:border-white/15 p-3 rounded-xl shadow-xs">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or USN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background dark:bg-black/70 border border-border dark:border-white/20 rounded-lg pl-9 pr-8 py-2 text-xs text-foreground dark:text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Center / Right: Batch Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
          <span className="text-[11px] font-mono-tech text-muted-foreground uppercase mr-1 hidden sm:inline">
            Batch:
          </span>
          <button
            type="button"
            onClick={() => setSelectedBatch("ALL")}
            className={`px-3 py-1.5 text-xs font-mono-tech font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              selectedBatch === "ALL"
                ? "bg-purple-600 text-white border-purple-500 shadow-xs"
                : "bg-muted/40 border-border dark:border-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Batches ({students.length})
          </button>

          {availableBatches.map((batch) => {
            const count = students.filter((s) => s.batch === batch).length;
            const isSelected = selectedBatch === batch;
            return (
              <button
                key={batch}
                type="button"
                onClick={() => setSelectedBatch(batch)}
                className={`px-3 py-1.5 text-xs font-mono-tech font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-purple-600 text-white border-purple-500 shadow-xs"
                    : "bg-muted/40 border-border dark:border-white/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Batch {batch}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  isSelected ? "bg-white/20 text-white" : "bg-muted dark:bg-white/10 text-muted-foreground"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: View Mode Toggle */}
        <div className="flex items-center gap-1 border border-border dark:border-white/15 bg-background dark:bg-black/60 p-1 rounded-lg shrink-0 self-end lg:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Table View"
            aria-label="Table View"
          >
            <LayoutListIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Card Grid View"
            aria-label="Card Grid View"
          >
            <LayoutGridIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong>{filteredStudents.length}</strong> of {students.length} participants
          {selectedBatch !== "ALL" && ` (Batch ${selectedBatch})`}
        </span>
      </div>

      {/* Empty State when Search has no match */}
      {filteredStudents.length === 0 ? (
        <div className="border border-border dark:border-white/15 bg-card/60 dark:bg-black/40 backdrop-blur-md rounded-2xl p-12 text-center text-muted-foreground">
          <UserIcon className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
          <p className="font-semibold text-foreground dark:text-white text-base">
            No students found
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query or clear the batch filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedBatch("ALL");
            }}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* ========================================================================= */
        /* MODERN TABLE VIEW */
        /* ========================================================================= */
        <div className="border border-border dark:border-white/15 bg-card/90 dark:bg-black/75 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border dark:border-white/10 bg-muted/40 dark:bg-white/5 text-[11px] font-mono-tech uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4 w-28 text-center">Batch</th>
                  <th className="py-3.5 px-4 w-36 text-center">Attendance</th>
                  <th className="py-3.5 px-4 w-32 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 dark:divide-white/5 text-sm">
                {filteredStudents.map((student) => {
                  const isCurrentUser = student.id === currentUserId;
                  const isTop3 = student.rank <= 3;
                  const medalIcons = ["🥇", "🥈", "🥉"];

                  return (
                    <tr
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`group transition-all duration-150 cursor-pointer ${
                        isCurrentUser
                          ? "bg-purple-500/10 dark:bg-purple-600/15 font-semibold hover:bg-purple-500/20"
                          : "hover:bg-muted/50 dark:hover:bg-white/5"
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {isTop3 ? (
                            <span className="text-xl" title={`Rank ${student.rank}`}>
                              {medalIcons[student.rank - 1]}
                            </span>
                          ) : (
                            <span className="font-mono-tech text-xs font-bold text-muted-foreground group-hover:text-foreground">
                              #{student.rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Student Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 border border-border dark:border-white/15">
                            <UserAvatar
                              src={student.image}
                              name={student.name}
                              size={36}
                              className="h-full w-full object-cover rounded-full"
                              fallbackClassName="h-full w-full text-xs"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground dark:text-white truncate">
                                {student.name || "AIML Student"}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-purple-600 text-white tracking-wider shrink-0">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-mono-tech text-muted-foreground block truncate">
                              {student.usn || "AIML"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Batch Column */}
                      <td className="py-3 px-4 text-center">
                        {student.batch ? (
                          <span className="text-[11px] font-mono-tech font-bold px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300">
                            {student.batch}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Attendance Column */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xs font-mono-tech font-bold text-emerald-600 dark:text-emerald-400">
                            {student.attendancePercentage ?? 0}%
                          </span>
                          <div className="w-16 h-1.5 bg-muted dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${Math.min(student.attendancePercentage ?? 0, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Points Column */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="font-sans text-sm sm:text-base font-extrabold text-foreground dark:text-white tracking-tight">
                            {student.marathonTotalScore.toLocaleString()}
                          </span>
                          <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">
                            PTS
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODERN CARD / GRID VIEW */
        /* ========================================================================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStudents.map((student) => {
            const isCurrentUser = student.id === currentUserId;
            const isTop3 = student.rank <= 3;
            const medals = ["🥇", "🥈", "🥉"];

            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                type="button"
                className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs ${
                  isCurrentUser
                    ? "bg-purple-500/10 dark:bg-purple-900/30 border-purple-500 ring-2 ring-purple-500/50"
                    : isTop3
                    ? "bg-card/90 dark:bg-black/80 border-amber-500/40 hover:border-amber-500/70"
                    : "bg-card/90 dark:bg-black/75 border-border dark:border-white/15 hover:border-purple-400 dark:hover:border-white/30"
                }`}
              >
                <div>
                  {/* Top: Rank Badge & Batch */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      {isTop3 ? (
                        <span className="text-lg">{medals[student.rank - 1]}</span>
                      ) : (
                        <span className="h-6 w-6 rounded-full bg-muted dark:bg-white/10 flex items-center justify-center text-xs font-mono-tech font-bold text-muted-foreground">
                          #{student.rank}
                        </span>
                      )}
                      {isCurrentUser && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-purple-600 text-white tracking-wider">
                          YOU
                        </span>
                      )}
                    </div>

                    {student.batch && (
                      <span className="text-[10px] font-mono-tech font-bold px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300">
                        Batch {student.batch}
                      </span>
                    )}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-11 w-11 rounded-full overflow-hidden shrink-0 border border-border dark:border-white/15">
                      <UserAvatar
                        src={student.image}
                        name={student.name}
                        size={44}
                        className="h-full w-full object-cover rounded-full"
                        fallbackClassName="h-full w-full text-xs font-bold"
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground dark:text-white truncate">
                        {student.name || "Student"}
                      </h4>
                      <p className="text-xs font-mono-tech text-muted-foreground truncate">
                        {student.usn || "AIML STUDENT"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom: Score & Attendance */}
                <div className="pt-3 border-t border-border dark:border-white/10 flex items-center justify-between text-xs font-mono-tech">
                  <div>
                    <span className="text-[9px] uppercase text-muted-foreground block">
                      SCORE
                    </span>
                    <span className="font-extrabold text-foreground dark:text-white text-sm">
                      {student.marathonTotalScore.toLocaleString()} pts
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase text-muted-foreground block">
                      ATTENDANCE
                    </span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {student.attendancePercentage ?? 0}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Profile Detail Modal */}
      {selectedStudent && (
        <ClientPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-sm rounded-2xl border border-border dark:border-white/20 bg-card dark:bg-[#180d2e] p-6 text-center shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150">
              {/* Close Button */}
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white p-1 rounded-lg hover:bg-muted dark:hover:bg-white/10 cursor-pointer"
                aria-label="Close Profile"
              >
                <XIcon className="h-5 w-5" />
              </button>

              {/* Profile Avatar */}
              <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center overflow-hidden mb-4 border-2 border-purple-500/40 shadow-inner">
                <UserAvatar
                  src={selectedStudent.image}
                  name={selectedStudent.name}
                  size={80}
                  className="h-full w-full object-cover rounded-full"
                  fallbackClassName="h-full w-full text-xl"
                />
              </div>

              {/* Student Name & USN */}
              <h3 className="font-sans text-lg font-bold text-foreground dark:text-white">
                {selectedStudent.name || "Student"}
              </h3>
              <p className="text-xs font-semibold text-muted-foreground dark:text-purple-200/80 uppercase tracking-wider mt-0.5">
                {selectedStudent.usn || "AIML STUDENT"}
              </p>

              {selectedStudent.batch && (
                <span className="inline-block mt-2 rounded bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[11px] font-mono-tech font-bold text-purple-700 dark:text-purple-300 uppercase">
                  Batch {selectedStudent.batch}
                </span>
              )}

              {selectedStudent.id === currentUserId && (
                <span className="inline-block mt-2 ml-1 rounded-full bg-purple-600 px-3 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                  Your Profile
                </span>
              )}

              {/* Clean 3-Stats Grid (No Streak) */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-border dark:border-white/10">
                {/* Rank */}
                <div className="p-3 rounded-xl bg-muted/60 dark:bg-black/50 border border-border dark:border-white/10">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400 block">
                    RANK
                  </span>
                  <span className="font-sans text-lg font-extrabold text-foreground dark:text-white mt-1 block">
                    #{selectedStudent.rank}
                  </span>
                </div>

                {/* Total Points */}
                <div className="p-3 rounded-xl bg-muted/60 dark:bg-black/50 border border-border dark:border-white/10">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400 block">
                    POINTS
                  </span>
                  <span className="font-sans text-lg font-extrabold text-foreground dark:text-white mt-1 block">
                    {selectedStudent.marathonTotalScore.toLocaleString()}
                  </span>
                </div>

                {/* Attendance */}
                <div className="p-3 rounded-xl bg-muted/60 dark:bg-black/50 border border-border dark:border-white/10">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400 block">
                    ATTENDANCE
                  </span>
                  <span className="font-sans text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {selectedStudent.attendancePercentage ?? 100}%
                  </span>
                </div>
              </div>

              {/* Close Action Button */}
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="mt-6 w-full rounded-xl bg-muted hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/20 border border-border dark:border-white/20 py-2.5 text-xs font-bold text-foreground dark:text-white uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </ClientPortal>
      )}
    </div>
  );
}
