import { FlameIcon } from "lucide-react";

export interface PodiumUser {
  id: string;
  name: string | null;
  usn: string | null;
  marathonTotalScore: number;
  marathonStreak: number;
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
          <div className="w-full rounded-none border border-border dark:border-white/20 bg-card dark:bg-[#180d2e] p-6 flex flex-col items-center text-center relative transition-colors hover:border-brand/40 dark:hover:border-white/40 shadow-sm">
            {/* Circular Rank Medal */}
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-base font-extrabold text-foreground dark:text-white mb-3 shadow-inner">
              🥈
            </div>

            {/* Circular Avatar */}
            <div className="flex h-16 w-16 rounded-full items-center justify-center bg-slate-100 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-500 text-xl font-bold text-foreground dark:text-slate-200 mb-2">
              {(second.name || "Student").charAt(0).toUpperCase()}
            </div>

            <h3 className="font-sans text-base font-bold text-foreground dark:text-white truncate max-w-[200px]">
              {second.name || "Student"}
            </h3>
            <p className="text-[11px] font-semibold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">
              {second.usn || "AIML STUDENT"}
            </p>

            {/* Circular Pill Stats */}
            <div className="mt-4 pt-3 border-t border-border dark:border-white/10 w-full flex items-center justify-around gap-1.5 flex-wrap">
              <div className="rounded-full bg-muted/60 dark:bg-white/10 border border-border dark:border-white/15 px-3 py-1">
                <span className="font-sans text-sm font-bold text-foreground dark:text-white">
                  {second.marathonTotalScore.toLocaleString()}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400 ml-1">
                  pts
                </span>
              </div>

              <div className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 flex items-center gap-1">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {second.attendancePercentage ?? 0}%
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
                  att
                </span>
              </div>

              <div className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 flex items-center gap-1">
                <FlameIcon className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {second.marathonStreak}d
                </span>
              </div>
            </div>

            {currentUserId === second.id && (
              <span className="mt-3 text-[11px] font-extrabold text-purple-600 dark:text-purple-400 tracking-wider">
                YOU
              </span>
            )}
          </div>
        </div>
      )}

      {/* 1st Place (Center, Elevated) */}
      {first && (
        <div className="order-1 md:order-2 flex flex-col items-center">
          <div className="w-full rounded-none border border-amber-500/40 dark:border-white/30 bg-card dark:bg-[#221040] p-7 flex flex-col items-center text-center relative transition-colors hover:border-amber-500/60 dark:hover:border-white/50 shadow-md">
            {/* Circular Crown Medal */}
            <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-800 dark:bg-white dark:text-black border border-amber-300 dark:border-white flex items-center justify-center text-xl font-black mb-3 shadow-sm">
              👑
            </div>

            {/* Circular Avatar */}
            <div className="flex h-20 w-20 rounded-full items-center justify-center bg-amber-50 dark:bg-black border-2 border-amber-400 dark:border-white/30 text-2xl font-black text-amber-900 dark:text-white mb-2 shadow-inner">
              {(first.name || "Student").charAt(0).toUpperCase()}
            </div>

            <h3 className="font-sans text-lg font-bold text-foreground dark:text-white truncate max-w-[220px]">
              {first.name || "Student"}
            </h3>
            <p className="text-[11px] font-semibold text-muted-foreground dark:text-slate-300 uppercase tracking-wider">
              {first.usn || "AIML STUDENT"}
            </p>

            {/* Circular Pill Stats */}
            <div className="mt-5 pt-3 border-t border-border dark:border-white/15 w-full flex items-center justify-around gap-1.5 flex-wrap">
              <div className="rounded-full bg-muted/60 dark:bg-white/10 border border-border dark:border-white/20 px-3.5 py-1.5">
                <span className="font-sans text-base font-bold text-foreground dark:text-white">
                  {first.marathonTotalScore.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-300 ml-1">
                  pts
                </span>
              </div>

              <div className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 flex items-center gap-1">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {first.attendancePercentage ?? 0}%
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
                  att
                </span>
              </div>

              <div className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 flex items-center gap-1">
                <FlameIcon className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {first.marathonStreak}d
                </span>
              </div>
            </div>

            {currentUserId === first.id && (
              <span className="mt-3 text-[11px] font-extrabold text-purple-600 dark:text-purple-400 tracking-wider">
                YOU
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3rd Place (Right) */}
      {third && (
        <div className="order-3 md:order-3 flex flex-col items-center">
          <div className="w-full rounded-none border border-border dark:border-white/20 bg-card dark:bg-[#180d2e] p-6 flex flex-col items-center text-center relative transition-colors hover:border-brand/40 dark:hover:border-white/40 shadow-sm">
            {/* Circular Rank Medal */}
            <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-white border border-amber-300 dark:border-amber-700 flex items-center justify-center text-base font-bold mb-3 shadow-inner">
              🥉
            </div>

            {/* Circular Avatar */}
            <div className="flex h-16 w-16 rounded-full items-center justify-center bg-amber-50 dark:bg-black border-2 border-amber-300 dark:border-white/20 text-xl font-bold text-amber-800 dark:text-amber-300 mb-2">
              {(third.name || "Student").charAt(0).toUpperCase()}
            </div>

            <h3 className="font-sans text-base font-bold text-foreground dark:text-white truncate max-w-[200px]">
              {third.name || "Student"}
            </h3>
            <p className="text-[11px] font-semibold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">
              {third.usn || "AIML STUDENT"}
            </p>

            {/* Circular Pill Stats */}
            <div className="mt-4 pt-3 border-t border-border dark:border-white/10 w-full flex items-center justify-around gap-1.5 flex-wrap">
              <div className="rounded-full bg-muted/60 dark:bg-white/10 border border-border dark:border-white/15 px-3 py-1">
                <span className="font-sans text-sm font-bold text-foreground dark:text-white">
                  {third.marathonTotalScore.toLocaleString()}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400 ml-1">
                  pts
                </span>
              </div>

              <div className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 flex items-center gap-1">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {third.attendancePercentage ?? 0}%
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
                  att
                </span>
              </div>

              <div className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 flex items-center gap-1">
                <FlameIcon className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {third.marathonStreak}d
                </span>
              </div>
            </div>

            {currentUserId === third.id && (
              <span className="mt-3 text-[11px] font-extrabold text-purple-600 dark:text-purple-400 tracking-wider">
                YOU
              </span>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
