import { AwardIcon } from "lucide-react";

export interface PodiumUser {
  id: string;
  name: string | null;
  usn: string | null;
  marathonTotalScore: number;
  marathonStreak?: number;
  image?: string | null;
  attendancePercentage?: number;
}

interface LeaderboardPodiumProps {
  topUsers: PodiumUser[];
  currentUserId?: string;
}

export default function LeaderboardPodium({ topUsers, currentUserId }: LeaderboardPodiumProps) {
  if (topUsers.length === 0) return null;

  const first = topUsers[0];
  const second = topUsers[1];
  const third = topUsers[2];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto mb-10 pt-4">
      
      {/* 2nd Place (Left) */}
      {second && (
        <div className="order-2 md:order-1 flex flex-col items-center">
          <div className="w-full rounded-2xl border border-slate-300 dark:border-slate-700/80 bg-gradient-to-b from-card to-muted/30 dark:from-[#15102a] dark:to-[#0f0b1e] p-6 flex flex-col items-center text-center relative transition-all duration-300 hover:-translate-y-1 hover:border-slate-400 dark:hover:border-slate-500 shadow-lg">
            {/* Circular Rank Medal */}
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-base font-extrabold text-foreground dark:text-white mb-3 shadow-inner">
              🥈
            </div>

            {/* Circular Avatar */}
            <div className="flex h-16 w-16 rounded-full items-center justify-center bg-slate-100 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-500 text-xl font-bold text-foreground dark:text-slate-200 mb-2 shadow-inner">
              {(second.name || "Student").charAt(0).toUpperCase()}
            </div>

            <h3 className="font-sans text-base font-bold text-foreground dark:text-white truncate max-w-[200px]">
              {second.name || "Student"}
            </h3>
            <p className="text-[11px] font-semibold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">
              {second.usn || "AIML STUDENT"}
            </p>

            {/* Metric Pills */}
            <div className="mt-4 pt-3 border-t border-border/80 dark:border-white/10 w-full flex items-center justify-center gap-2 flex-wrap">
              <div className="rounded-full bg-muted/80 dark:bg-white/10 border border-border dark:border-white/15 px-3.5 py-1">
                <span className="font-sans text-sm font-extrabold text-foreground dark:text-white">
                  {second.marathonTotalScore.toLocaleString()}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400 ml-1">
                  pts
                </span>
              </div>

              <div className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 flex items-center gap-1">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {second.attendancePercentage ?? 0}%
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
                  att
                </span>
              </div>
            </div>

            {currentUserId === second.id && (
              <span className="mt-3 text-[10px] font-extrabold text-purple-600 dark:text-purple-400 tracking-wider bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                YOU
              </span>
            )}
          </div>
        </div>
      )}

      {/* 1st Place (Center, Elevated) */}
      {first && (
        <div className="order-1 md:order-2 flex flex-col items-center">
          <div className="w-full rounded-2xl border-2 border-amber-500/50 dark:border-amber-400/50 bg-gradient-to-b from-amber-500/10 via-card to-card dark:from-amber-500/15 dark:via-[#1e1038] dark:to-[#130926] p-7 flex flex-col items-center text-center relative transition-all duration-300 hover:-translate-y-1.5 shadow-xl shadow-amber-500/10">
            {/* Floating Crown Medal */}
            <div className="h-12 w-12 rounded-full bg-amber-400/20 text-amber-500 dark:bg-amber-400/20 dark:text-amber-300 border-2 border-amber-400/60 flex items-center justify-center text-2xl font-black mb-3 shadow-lg shadow-amber-500/20 animate-bounce-slow">
              👑
            </div>

            {/* Circular Avatar */}
            <div className="flex h-20 w-20 rounded-full items-center justify-center bg-amber-100 dark:bg-black/60 border-2 border-amber-400 text-2xl font-black text-amber-900 dark:text-amber-300 mb-2 shadow-inner">
              {(first.name || "Student").charAt(0).toUpperCase()}
            </div>

            <h3 className="font-sans text-lg font-bold text-foreground dark:text-white truncate max-w-[220px]">
              {first.name || "Student"}
            </h3>
            <p className="text-[11px] font-semibold text-muted-foreground dark:text-slate-300 uppercase tracking-wider">
              {first.usn || "AIML STUDENT"}
            </p>

            {/* Metric Pills */}
            <div className="mt-5 pt-3 border-t border-amber-500/20 dark:border-white/15 w-full flex items-center justify-center gap-2 flex-wrap">
              <div className="rounded-full bg-amber-500/15 border border-amber-500/30 px-4 py-1.5 shadow-xs">
                <span className="font-sans text-base font-extrabold text-amber-700 dark:text-amber-300">
                  {first.marathonTotalScore.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 ml-1">
                  pts
                </span>
              </div>

              <div className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 flex items-center gap-1 shadow-xs">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {first.attendancePercentage ?? 0}%
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
                  att
                </span>
              </div>
            </div>

            {currentUserId === first.id && (
              <span className="mt-3 text-[10px] font-extrabold text-purple-600 dark:text-purple-400 tracking-wider bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                YOU
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3rd Place (Right) */}
      {third && (
        <div className="order-3 md:order-3 flex flex-col items-center">
          <div className="w-full rounded-2xl border border-amber-700/30 dark:border-amber-700/50 bg-gradient-to-b from-card to-muted/30 dark:from-[#170e28] dark:to-[#0f0b1e] p-6 flex flex-col items-center text-center relative transition-all duration-300 hover:-translate-y-1 hover:border-amber-600/50 shadow-lg">
            {/* Circular Rank Medal */}
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-2 border-amber-600/60 flex items-center justify-center text-base font-bold mb-3 shadow-inner">
              🥉
            </div>

            {/* Circular Avatar */}
            <div className="flex h-16 w-16 rounded-full items-center justify-center bg-amber-50 dark:bg-black/60 border-2 border-amber-600/50 text-xl font-bold text-amber-800 dark:text-amber-300 mb-2 shadow-inner">
              {(third.name || "Student").charAt(0).toUpperCase()}
            </div>

            <h3 className="font-sans text-base font-bold text-foreground dark:text-white truncate max-w-[200px]">
              {third.name || "Student"}
            </h3>
            <p className="text-[11px] font-semibold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">
              {third.usn || "AIML STUDENT"}
            </p>

            {/* Metric Pills */}
            <div className="mt-4 pt-3 border-t border-border/80 dark:border-white/10 w-full flex items-center justify-center gap-2 flex-wrap">
              <div className="rounded-full bg-muted/80 dark:bg-white/10 border border-border dark:border-white/15 px-3.5 py-1">
                <span className="font-sans text-sm font-extrabold text-foreground dark:text-white">
                  {third.marathonTotalScore.toLocaleString()}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400 ml-1">
                  pts
                </span>
              </div>

              <div className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 flex items-center gap-1">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {third.attendancePercentage ?? 0}%
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
                  att
                </span>
              </div>
            </div>

            {currentUserId === third.id && (
              <span className="mt-3 text-[10px] font-extrabold text-purple-600 dark:text-purple-400 tracking-wider bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                YOU
              </span>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
