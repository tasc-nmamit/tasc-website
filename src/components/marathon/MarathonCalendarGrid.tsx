"use client";

import { useState, useMemo } from "react";
import {
  format,
  isToday,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subMonths,
  addMonths,
} from "date-fns";
import {
  CalendarIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

export interface CalendarContest {
  id: string;
  title: string;
  dayNumber?: number;
  date: Date;
  deadline?: Date;
  type?: "DAILY" | "WEEKLY";
  link: string;
}

export interface CalendarAttendanceRecord {
  id: string;
  classId: string;
  date: Date;
  topic: string | null;
  batch: string;
  present: boolean;
}

interface MarathonCalendarGridProps {
  currentDate?: Date;
  startMonth?: Date;
  daysInMonth?: Date[];
  contests: CalendarContest[];
  attendance?: CalendarAttendanceRecord[];
  userBatch?: string | null;
}

export default function MarathonCalendarGrid({
  currentDate = new Date(),
  contests = [],
  attendance = [],
  userBatch,
}: MarathonCalendarGridProps) {
  // Allow interactive month navigation
  const [viewDate, setViewDate] = useState<Date>(currentDate);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Compute start, end, and days for currently viewed month
  const currentStartMonth = useMemo(() => startOfMonth(viewDate), [viewDate]);
  const currentEndMonth = useMemo(() => endOfMonth(viewDate), [viewDate]);
  const currentDaysInMonth = useMemo(
    () => eachDayOfInterval({ start: currentStartMonth, end: currentEndMonth }),
    [currentStartMonth, currentEndMonth]
  );
  const isCurrentViewingMonth = isSameMonth(viewDate, new Date());

  const handlePrevMonth = () => {
    setViewDate((prev) => subMonths(prev, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setViewDate((prev) => addMonths(prev, 1));
    setSelectedDay(null);
  };

  const handleResetToday = () => {
    setViewDate(new Date());
    setSelectedDay(null);
  };

  // Find contest on selected day
  const selectedContest = selectedDay
    ? contests.find(
        (c) =>
          new Date(c.date).getFullYear() === selectedDay.getFullYear() &&
          new Date(c.date).getMonth() === selectedDay.getMonth() &&
          new Date(c.date).getDate() === selectedDay.getDate()
      )
    : null;

  // Find attendance record on selected day
  const selectedAttendance = selectedDay
    ? attendance.find(
        (a) =>
          new Date(a.date).getFullYear() === selectedDay.getFullYear() &&
          new Date(a.date).getMonth() === selectedDay.getMonth() &&
          new Date(a.date).getDate() === selectedDay.getDate()
      )
    : null;

  // Monthly summary stats for active month
  const monthAttendance = useMemo(() => {
    return attendance.filter((a) => isSameMonth(new Date(a.date), viewDate));
  }, [attendance, viewDate]);

  const monthContests = useMemo(() => {
    return contests.filter((c) => isSameMonth(new Date(c.date), viewDate));
  }, [contests, viewDate]);

  const monthPresentCount = monthAttendance.filter((a) => a.present).length;

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Calendar Header */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-border dark:border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center bg-brand/10 dark:bg-white/10 border border-brand/20 dark:border-white/15 text-foreground dark:text-white rounded">
              <CalendarIcon className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400 block">
                SCHEDULE {userBatch ? `• BATCH ${userBatch}` : ""}
              </span>
              <h3 className="font-valley text-lg font-bold text-foreground dark:text-white tracking-tight">
                {format(viewDate, "MMMM yyyy")}
              </h3>
            </div>
          </div>

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-1.5">
            {!isCurrentViewingMonth && (
              <button
                type="button"
                onClick={handleResetToday}
                className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-1 rounded hover:bg-purple-500/20 transition-all cursor-pointer"
                title="Jump to current month"
              >
                Today
              </button>
            )}
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-border dark:border-white/15 bg-muted/60 dark:bg-white/5 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/15 transition-all cursor-pointer"
              aria-label="Previous month"
              title="Previous month"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-border dark:border-white/15 bg-muted/60 dark:bg-white/5 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/15 transition-all cursor-pointer"
              aria-label="Next month"
              title="Next month"
            >
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400 mb-2">
          {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1">
          {/* Leading empty days */}
          {Array.from({ length: currentStartMonth.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days of the Month */}
          {currentDaysInMonth.map((day) => {
            const dayContest = contests.find(
              (c) =>
                new Date(c.date).getFullYear() === day.getFullYear() &&
                new Date(c.date).getMonth() === day.getMonth() &&
                new Date(c.date).getDate() === day.getDate()
            );
            const hasContest = Boolean(dayContest);

            const dayAttendance = attendance.find(
              (a) =>
                new Date(a.date).getFullYear() === day.getFullYear() &&
                new Date(a.date).getMonth() === day.getMonth() &&
                new Date(a.date).getDate() === day.getDate()
            );
            const hasAttendance = Boolean(dayAttendance);

            const isCurrentDay = isToday(day);
            const isSelected =
              selectedDay &&
              selectedDay.getDate() === day.getDate() &&
              selectedDay.getMonth() === day.getMonth();

            // Background & border dynamic styling
            let cellStyle =
              "text-foreground/80 dark:text-slate-300 border-border/60 dark:border-white/5 hover:bg-muted dark:hover:bg-white/5 hover:border-border dark:hover:border-white/15";

            if (!isSameMonth(day, viewDate)) {
              cellStyle = "text-muted-foreground/30 dark:text-slate-600 border-transparent pointer-events-none";
            } else if (isCurrentDay) {
              cellStyle = "bg-purple-600 text-white font-bold border-purple-500 shadow-sm";
            } else if (isSelected) {
              cellStyle =
                "ring-1 ring-purple-500 bg-purple-500/15 text-foreground dark:ring-white dark:bg-white/20 dark:text-white border-purple-500/40 dark:border-white/30";
            } else if (dayAttendance && !dayAttendance.present) {
              // Missed class session - red highlight
              cellStyle =
                "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-200 hover:bg-rose-500/25";
            } else if (dayAttendance && dayAttendance.present) {
              // Attended class session - subtle green highlight
              cellStyle =
                "bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/25";
            } else if (hasContest) {
              cellStyle =
                "bg-purple-500/10 border-purple-500/30 text-purple-900 dark:bg-white/10 dark:border-white/20 dark:text-white hover:bg-purple-500/20";
            }

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`relative flex aspect-square flex-col items-center justify-center text-xs font-sans font-semibold border transition-colors cursor-pointer rounded-sm ${cellStyle}`}
              >
                <span>{format(day, "d")}</span>

                {/* Indicator dots container */}
                <div className="absolute bottom-1 flex items-center justify-center gap-1">
                  {hasContest && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isCurrentDay ? "bg-white" : "bg-purple-500 dark:bg-purple-400"
                      }`}
                      title={`Contest: ${dayContest?.title}`}
                    />
                  )}
                  {dayAttendance && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        dayAttendance.present
                          ? "bg-emerald-500 dark:bg-emerald-400"
                          : "bg-rose-500 ring-1 ring-rose-400"
                      }`}
                      title={
                        dayAttendance.present
                          ? `Present in class (${dayAttendance.batch})`
                          : `Absent from class (${dayAttendance.batch})`
                      }
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Info / Legend Area */}
      <div className="mt-5 pt-3 border-t border-border dark:border-white/10">
        {selectedDay ? (
          <div className="bg-card dark:bg-black/60 border border-border dark:border-white/15 p-3 space-y-2.5 rounded-lg shadow-sm">
            <div className="flex items-center justify-between border-b border-border dark:border-white/10 pb-2">
              <span className="text-[11px] font-bold text-foreground dark:text-slate-300 uppercase">
                {format(selectedDay, "EEEE, MMM d, yyyy")}
              </span>
              <div className="flex items-center gap-1.5">
                {isToday(selectedDay) && (
                  <span className="bg-purple-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase rounded">
                    TODAY
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="text-[10px] text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white underline cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Attendance Record for Selected Day */}
            {selectedAttendance && (
              <div
                className={`p-2.5 border rounded flex items-center justify-between gap-3 ${
                  selectedAttendance.present
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-rose-500/40 bg-rose-500/10"
                }`}
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    {selectedAttendance.present ? (
                      <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <XCircleIcon className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
                    )}
                    <span className="text-[10px] font-mono-tech font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-300">
                      CLASS SESSION • BATCH {selectedAttendance.batch}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground dark:text-white truncate">
                    {selectedAttendance.topic || "Marathon Class Session"}
                  </h4>
                </div>

                <span
                  className={`text-[10px] font-mono-tech font-bold px-2 py-0.5 rounded border shrink-0 ${
                    selectedAttendance.present
                      ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "border-rose-500/50 bg-rose-500/20 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {selectedAttendance.present ? "✓ PRESENT" : "✗ ABSENT"}
                </span>
              </div>
            )}

            {/* Contest for Selected Day */}
            {selectedContest && (
              <div className="p-2.5 border border-purple-500/30 bg-purple-500/10 rounded flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono-tech text-purple-700 dark:text-purple-300 block uppercase font-bold">
                    {selectedContest.type === "WEEKLY" ? "WEEKLY SPRINT" : "CONTEST"}
                    {selectedContest.dayNumber ? ` • #${selectedContest.dayNumber}` : ""}
                  </span>
                  <h4 className="text-xs font-bold text-foreground dark:text-white truncate mt-0.5">
                    {selectedContest.title}
                  </h4>
                </div>
                <a
                  href={selectedContest.link}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-purple-600 hover:bg-purple-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shrink-0 transition-colors rounded"
                >
                  Open →
                </a>
              </div>
            )}

            {!selectedAttendance && !selectedContest && (
              <p className="text-xs text-muted-foreground dark:text-slate-400 py-1">
                No classes or contests scheduled on this date.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-muted-foreground dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 bg-purple-600 rounded-xs" />
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400" />
                <span>Contest</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                <span>Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <span>Absent</span>
              </div>
            </div>

            <div className="text-[10px] font-mono-tech text-muted-foreground dark:text-slate-400 flex items-center justify-between pt-1 border-t border-border dark:border-white/5">
              <span>{format(viewDate, "MMMM yyyy")}:</span>
              <span className="text-foreground dark:text-slate-300 font-semibold">
                {monthAttendance.length > 0
                  ? `${monthPresentCount}/${monthAttendance.length} classes attended`
                  : "No classes scheduled"}
                {monthContests.length > 0 ? ` • ${monthContests.length} contest(s)` : ""}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
