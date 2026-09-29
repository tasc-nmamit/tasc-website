"use client";

import { useState, useEffect } from "react";
import { FlameIcon, XIcon, SearchIcon } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import ClientPortal from "@/components/ui/ClientPortal";

export interface LeaderboardStudent {
  id: string;
  name: string | null;
  usn: string | null;
  marathonTotalScore: number;
  marathonStreak: number;
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

  const filteredStudents = students.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.usn && s.usn.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-8">
      {/* Search and Count Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search student or USN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card dark:bg-black/80 border border-border dark:border-white/20 rounded-full pl-10 pr-4 py-2 text-xs text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:outline-none focus:border-purple-500 shadow-sm"
          />
        </div>

        <div className="text-xs text-muted-foreground dark:text-slate-400 font-semibold tracking-wider uppercase">
          Showing {filteredStudents.length} of {students.length} Rankers
        </div>
      </div>

      {/* Grid of Circular Student Profiles (Click Only, No Hover Popups, No Glow) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 justify-items-center">
        {filteredStudents.map((student) => {
          const isCurrentUser = student.id === currentUserId;
          const isTop3 = student.rank <= 3;

          return (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              type="button"
              className={`relative flex flex-col items-center justify-center h-32 w-32 sm:h-36 sm:w-36 rounded-full border text-center p-3 transition-colors cursor-pointer shadow-sm ${
                isCurrentUser
                  ? "bg-purple-100 dark:bg-purple-950/80 border-purple-500 dark:border-white/40 ring-2 ring-purple-500"
                  : isTop3
                  ? "bg-card dark:bg-black/90 border-amber-500/40 dark:border-white/30 hover:border-amber-500 dark:hover:border-white/50"
                  : "bg-card dark:bg-black/80 border-border dark:border-white/15 hover:border-purple-400 dark:hover:border-white/40"
              }`}
            >
              {/* Rank Circle Badge */}
              <div
                className={`absolute -top-1.5 h-6 w-6 rounded-full flex items-center justify-center font-sans text-[10px] font-bold shrink-0 shadow-xs ${
                  student.rank === 1
                    ? "bg-amber-400 text-black border border-amber-400 dark:bg-white dark:border-white"
                    : student.rank === 2
                    ? "bg-slate-300 text-black border border-slate-300"
                    : student.rank === 3
                    ? "bg-amber-600 text-white border border-amber-600"
                    : "bg-muted text-foreground border border-border dark:bg-black dark:text-white dark:border-white/20"
                }`}
              >
                {student.rank}
              </div>

              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center overflow-hidden mb-1.5 shrink-0">
                <UserAvatar
                  src={student.image}
                  name={student.name}
                  size={56}
                  className="h-full w-full object-cover rounded-full"
                  fallbackClassName="h-full w-full"
                />
              </div>

              {/* Student Name */}
              <span className="font-sans font-bold text-xs text-foreground dark:text-white truncate max-w-[95px] block">
                {student.name || "Student"}
              </span>

              {/* Points Text */}
              <span className="text-[10px] text-muted-foreground dark:text-slate-300 font-semibold block mt-0.5">
                {student.marathonTotalScore.toLocaleString()} pts
              </span>

              {isCurrentUser && (
                <span className="absolute -bottom-1.5 bg-purple-600 text-white text-[8px] font-bold uppercase px-2 py-0.2 rounded-full">
                  YOU
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Profile Detail Modal (Sharp Box with Purple Shade Background) */}
      {selectedStudent && (
        <ClientPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-sm rounded-none border border-border dark:border-white/20 bg-card dark:bg-[#180d2e] p-6 text-center shadow-xl my-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white p-1 cursor-pointer"
              aria-label="Close Profile"
            >
              <XIcon className="h-5 w-5" />
            </button>

            {/* Profile Avatar */}
            <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center overflow-hidden mb-4 shadow-inner">
              <UserAvatar
                src={selectedStudent.image}
                name={selectedStudent.name}
                size={80}
                className="h-full w-full object-cover rounded-full"
                fallbackClassName="h-full w-full"
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
              <span className="inline-block mt-1 rounded bg-brand/15 border border-brand/30 px-2 py-0.5 text-[10px] font-mono-tech font-bold text-brand-accent uppercase">
                Batch {selectedStudent.batch}
              </span>
            )}

            {selectedStudent.id === currentUserId && (
              <span className="inline-block mt-2 ml-1 rounded-full bg-purple-600 px-3 py-0.5 text-[9px] font-bold text-white uppercase">
                Your Profile
              </span>
            )}

            {/* Full Stats Overview (Sharp Boxes) */}
            <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-border dark:border-white/10">
              {/* Rank */}
              <div className="p-2 rounded-none bg-muted/60 dark:bg-black/50 border border-border dark:border-white/10">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400 block">
                  RANK
                </span>
                <span className="font-sans text-base font-bold text-foreground dark:text-white mt-1 block">
                  #{selectedStudent.rank}
                </span>
              </div>

              {/* Total Points */}
              <div className="p-2 rounded-none bg-muted/60 dark:bg-black/50 border border-border dark:border-white/10">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400 block">
                  POINTS
                </span>
                <span className="font-sans text-base font-bold text-foreground dark:text-white mt-1 block">
                  {selectedStudent.marathonTotalScore.toLocaleString()}
                </span>
              </div>

              {/* Day Streak */}
              <div className="p-2 rounded-none bg-muted/60 dark:bg-black/50 border border-border dark:border-white/10">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400 block">
                  STREAK
                </span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <FlameIcon className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <span className="font-sans text-base font-bold text-amber-600 dark:text-amber-400">
                    {selectedStudent.marathonStreak}d
                  </span>
                </div>
              </div>

              {/* Attendance */}
              <div className="p-2 rounded-none bg-muted/60 dark:bg-black/50 border border-border dark:border-white/10">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400 block">
                  ATTEND
                </span>
                <span className="font-sans text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {selectedStudent.attendancePercentage ?? 100}%
                </span>
              </div>
            </div>

            {/* Action Button (Sharp) */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="mt-6 w-full rounded-none bg-muted hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/20 border border-border dark:border-white/20 py-2.5 text-xs font-bold text-foreground dark:text-white uppercase tracking-wider transition-colors cursor-pointer"
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
