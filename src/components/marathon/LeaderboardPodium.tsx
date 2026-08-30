import { FlameIcon } from "lucide-react";

export interface PodiumUser {
  id: string;
  name: string | null;
  usn: string | null;
  marathonTotalScore: number;
  marathonStreak: number;
  image?: string | null;
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
          <div className="w-full rounded-none border border-white/20 bg-[#180d2e] p-6 flex flex-col items-center text-center relative transition-colors hover:border-white/40">
            {/* Circular Rank Medal */}
            <div className="h-10 w-10 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-base font-extrabold text-white mb-3">
              🥈
            </div>

            {/* Circular Avatar */}
            <div className="flex h-16 w-16 rounded-full items-center justify-center bg-slate-800 border-2 border-slate-500 text-xl font-bold text-slate-200 mb-2">
              {(second.name || "Student").charAt(0).toUpperCase()}
            </div>

            <h3 className="font-sans text-base font-bold text-white truncate max-w-[200px]">
              {second.name || "Student"}
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {second.usn || "AIML STUDENT"}
            </p>

            {/* Circular Pill Stats */}
            <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-around gap-2">
              <div className="rounded-full bg-white/10 border border-white/15 px-3.5 py-1">
                <span className="font-sans text-sm font-bold text-white">
                  {second.marathonTotalScore.toLocaleString()}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                  pts
                </span>
              </div>

              <div className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 flex items-center gap-1">
                <FlameIcon className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span className="text-xs font-bold text-amber-400">
                  {second.marathonStreak}d
                </span>
              </div>
            </div>

            {currentUserId === second.id && (
              <span className="mt-3 text-[11px] font-extrabold text-purple-400 tracking-wider">
                YOU
              </span>
            )}
          </div>
        </div>
      )}

      {/* 1st Place (Center, Elevated) */}
      {first && (
        <div className="order-1 md:order-2 flex flex-col items-center">
          <div className="w-full rounded-none border border-white/30 bg-[#221040] p-7 flex flex-col items-center text-center relative transition-colors hover:border-white/50">
            {/* Circular Crown Medal */}
            <div className="h-12 w-12 rounded-full bg-white text-black border border-white flex items-center justify-center text-xl font-black mb-3">
              👑
            </div>

            {/* Circular Avatar */}
            <div className="flex h-20 w-20 rounded-full items-center justify-center bg-black border border-white/30 text-2xl font-black text-white mb-2">
              {(first.name || "Student").charAt(0).toUpperCase()}
            </div>

            <h3 className="font-sans text-lg font-bold text-white truncate max-w-[220px]">
              {first.name || "Student"}
            </h3>
            <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              {first.usn || "AIML STUDENT"}
            </p>

            {/* Circular Pill Stats */}
            <div className="mt-5 pt-3 border-t border-white/15 w-full flex items-center justify-around gap-2">
              <div className="rounded-full bg-white/10 border border-white/20 px-4 py-1.5">
                <span className="font-sans text-base font-bold text-white">
                  {first.marathonTotalScore.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 ml-1">
                  pts
                </span>
              </div>

              <div className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 flex items-center gap-1">
                <FlameIcon className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="text-xs font-bold text-amber-400">
                  {first.marathonStreak}d
                </span>
              </div>
            </div>

            {currentUserId === first.id && (
              <span className="mt-3 text-[11px] font-extrabold text-purple-400 tracking-wider">
                YOU
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3rd Place (Right) */}
      {third && (
        <div className="order-3 md:order-3 flex flex-col items-center">
          <div className="w-full rounded-none border border-white/20 bg-[#180d2e] p-6 flex flex-col items-center text-center relative transition-colors hover:border-white/40">
            {/* Circular Rank Medal */}
            <div className="h-10 w-10 rounded-full bg-amber-700 text-white border border-amber-700 flex items-center justify-center text-base font-bold mb-3">
              🥉
            </div>

            {/* Circular Avatar */}
            <div className="flex h-16 w-16 rounded-full items-center justify-center bg-black border border-white/20 text-xl font-bold text-amber-300 mb-2">
              {(third.name || "Student").charAt(0).toUpperCase()}
            </div>

            <h3 className="font-sans text-base font-bold text-white truncate max-w-[200px]">
              {third.name || "Student"}
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {third.usn || "AIML STUDENT"}
            </p>

            {/* Circular Pill Stats */}
            <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-around gap-2">
              <div className="rounded-full bg-white/10 border border-white/15 px-3.5 py-1">
                <span className="font-sans text-sm font-bold text-white">
                  {third.marathonTotalScore.toLocaleString()}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                  pts
                </span>
              </div>

              <div className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 flex items-center gap-1">
                <FlameIcon className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span className="text-xs font-bold text-amber-400">
                  {third.marathonStreak}d
                </span>
              </div>
            </div>

            {currentUserId === third.id && (
              <span className="mt-3 text-[11px] font-extrabold text-purple-400 tracking-wider">
                YOU
              </span>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
