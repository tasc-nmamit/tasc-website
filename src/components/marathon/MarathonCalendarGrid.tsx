"use client";

import { useState } from "react";
import { format, isToday, isSameMonth } from "date-fns";
import { CalendarIcon } from "lucide-react";

export interface CalendarContest {
  id: string;
  title: string;
  dayNumber: number;
  date: Date;
  link: string;
}

interface MarathonCalendarGridProps {
  currentDate: Date;
  startMonth: Date;
  daysInMonth: Date[];
  contests: CalendarContest[];
}

export default function MarathonCalendarGrid({
  currentDate,
  startMonth,
  daysInMonth,
  contests,
}: MarathonCalendarGridProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const selectedContest = selectedDay
    ? contests.find(
        (c) =>
          c.date.getFullYear() === selectedDay.getFullYear() &&
          c.date.getMonth() === selectedDay.getMonth() &&
          c.date.getDate() === selectedDay.getDate()
      )
    : null;

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Calendar Header */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center bg-white/10 border border-white/15 text-white">
              <CalendarIcon className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                SCHEDULE
              </span>
              <h3 className="font-valley text-lg font-bold text-white tracking-tight">
                {format(currentDate, "MMMM yyyy")}
              </h3>
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1">
            MONTHLY VIEW
          </span>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1">
          {/* Leading empty days */}
          {Array.from({ length: startMonth.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days of the Month */}
          {daysInMonth.map((day) => {
            const hasContest = contests.some(
              (c) =>
                c.date.getFullYear() === day.getFullYear() &&
                c.date.getMonth() === day.getMonth() &&
                c.date.getDate() === day.getDate()
            );
            const isCurrentDay = isToday(day);
            const isSelected =
              selectedDay &&
              selectedDay.getDate() === day.getDate() &&
              selectedDay.getMonth() === day.getMonth();

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`relative flex aspect-square items-center justify-center text-xs font-sans font-semibold border transition-colors cursor-pointer ${
                  !isSameMonth(day, currentDate)
                    ? "text-slate-600 border-transparent pointer-events-none"
                    : isCurrentDay
                    ? "bg-purple-600 text-white font-bold border-purple-500"
                    : hasContest
                    ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    : "text-slate-300 border-white/5 hover:bg-white/5 hover:border-white/15"
                } ${
                  isSelected && !isCurrentDay
                    ? "ring-1 ring-white bg-white/20 text-white"
                    : ""
                }`}
              >
                <span>{format(day, "d")}</span>
                {hasContest && !isCurrentDay && (
                  <span className="absolute bottom-1 h-1 w-1 bg-purple-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Info / Legend Area */}
      <div className="mt-5 pt-3 border-t border-white/10">
        {selectedDay ? (
          <div className="bg-black/60 border border-white/15 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase">
                {format(selectedDay, "EEEE, MMM d")}
              </span>
              {isToday(selectedDay) && (
                <span className="bg-purple-600 px-2 py-0.5 text-[9px] font-bold text-white">
                  TODAY
                </span>
              )}
            </div>
            {selectedContest ? (
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-white truncate">
                  Day {selectedContest.dayNumber}: {selectedContest.title}
                </span>
                <a
                  href={selectedContest.link}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-purple-600 hover:bg-purple-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shrink-0 transition-colors"
                >
                  Open →
                </a>
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-400">
                No contest scheduled on this date.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-slate-400">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 bg-purple-600" />
              <span>Current Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 border border-white/20 bg-white/10" />
              <span>Scheduled Contest</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
