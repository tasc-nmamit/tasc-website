"use client";

import { useRef, useEffect, useState } from "react";
import { format, isToday, isFuture, isPast, isSameDay } from "date-fns";

export interface JourneyDay {
  date: Date;
  contestTitle?: string;
  dayNumber?: number;
  hasContest: boolean;
  score?: number;
  link?: string;
}

interface MarathonJourneyProps {
  days: JourneyDay[];
}

export default function MarathonJourney({ days }: MarathonJourneyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDay, setSelectedDay] = useState<JourneyDay | null>(null);

  // Auto-scroll to today on initial mount
  useEffect(() => {
    if (containerRef.current) {
      const todayElement = containerRef.current.querySelector('[data-is-today="true"]');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, []);

  return (
    <div className="w-full">
      {/* Scrollable Timeline */}
      <div 
        ref={containerRef}
        className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth"
      >
        {days.map((item, index) => {
          const currentDay = isToday(item.date);
          const futureDay = isFuture(item.date);
          const pastDay = isPast(item.date) && !currentDay;
          const isSolved = typeof item.score === "number" && item.score > 0;
          const isSelected = selectedDay && isSameDay(selectedDay.date, item.date);

          return (
            <div
              key={item.date.toISOString()}
              data-is-today={currentDay}
              className="flex flex-col items-center flex-shrink-0 relative group cursor-pointer"
              onClick={() => setSelectedDay(isSelected ? null : item)}
            >
              {/* Top Tag / Status */}
              <div className="h-5 flex items-center justify-center mb-1.5">
                {currentDay ? (
                  <span className="bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase">
                    LIVE
                  </span>
                ) : isSolved ? (
                  <span className="bg-purple-500/20 border border-purple-500/40 px-1.5 py-0.5 text-[9px] font-bold text-purple-300">
                    +{item.score}
                  </span>
                ) : item.hasContest && futureDay ? (
                  <span className="text-[9px] font-bold text-slate-500">
                    SOON
                  </span>
                ) : (
                  <span className="text-[9px] text-transparent select-none">-</span>
                )}
              </div>

              {/* Node & Connecting Line Row */}
              <div className="flex items-center w-20 md:w-24 justify-center relative">
                {/* Connecting Line Left */}
                {index > 0 && (
                  <div 
                    className={`absolute left-0 right-1/2 h-[1px] ${
                      pastDay || currentDay ? "bg-white/30" : "bg-white/10"
                    }`} 
                  />
                )}
                {/* Connecting Line Right */}
                {index < days.length - 1 && (
                  <div 
                    className={`absolute left-1/2 right-0 h-[1px] ${
                      pastDay ? "bg-white/30" : "bg-white/10"
                    }`} 
                  />
                )}

                {/* Main Node Square (Sharp) */}
                <div
                  className={`relative z-10 flex h-6 w-6 items-center justify-center text-xs font-bold transition-colors ${
                    currentDay
                      ? "bg-emerald-500 text-black border border-emerald-400 font-extrabold"
                      : isSolved
                      ? "bg-purple-600 text-white border border-purple-400"
                      : item.hasContest
                      ? "border border-white/40 bg-black text-white hover:border-white"
                      : "border border-white/10 bg-black text-slate-600"
                  } ${isSelected ? "ring-2 ring-white" : ""}`}
                >
                  {isSolved ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : item.hasContest ? (
                    <span className="text-[9px]">
                      {item.dayNumber || format(item.date, "d")}
                    </span>
                  ) : (
                    <span className="h-1 w-1 bg-white/20" />
                  )}
                </div>
              </div>

              {/* Bottom Date Label */}
              <div className="mt-2 text-center">
                <span className={`block text-xs font-semibold ${
                  currentDay ? "text-white font-bold" : "text-slate-400"
                }`}>
                  {currentDay ? "TODAY" : format(item.date, "MMM d")}
                </span>
                <span className="block text-[10px] text-slate-500">
                  {format(item.date, "EEE")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Info Box */}
      {selectedDay && (
        <div className="mt-4 border border-white/15 bg-black/70 p-3.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  {format(selectedDay.date, "EEEE, MMMM d, yyyy")}
                </span>
                {isToday(selectedDay.date) && (
                  <span className="bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                    TODAY
                  </span>
                )}
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {selectedDay.contestTitle || (selectedDay.hasContest ? `Day ${selectedDay.dayNumber} Challenge` : "No challenge scheduled")}
              </h4>
            </div>

            <div className="flex items-center gap-3">
              {typeof selectedDay.score === "number" && selectedDay.score > 0 && (
                <div className="text-xs font-bold text-emerald-400">
                  Earned: +{selectedDay.score} pts
                </div>
              )}
              {selectedDay.link && (
                <a
                  href={selectedDay.link}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-purple-600 hover:bg-purple-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white transition-colors"
                >
                  Open Problem →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
