"use client";

import { useState } from "react";
import { format, isToday, isSameMonth } from "date-fns";
import { CalendarIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";

export interface CalendarContest {
  id: string;
  title: string;
  dayNumber: number;
  date: Date;
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
  currentDate: Date;
  startMonth: Date;
  daysInMonth: Date[];
  contests: CalendarContest[];
  attendance?: CalendarAttendanceRecord[];
  userBatch?: string | null;
}

export default function MarathonCalendarGrid({
  currentDate,
  startMonth,
  daysInMonth,
  contests,
  attendance = [],
  userBatch,
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

  const selectedAttendance = selectedDay
    ? attendance.find(
        (a) =>
          a.date.getFullYear() === selectedDay.getFullYear() &&
          a.date.getMonth() === selectedDay.getMonth() &&
          a.date.getDate() === selectedDay.getDate()
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
                SCHEDULE {userBatch ? `• BATCH ${userBatch}` : ""}
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
            const dayContest = contests.find(
              (c) =>
                c.date.getFullYear() === day.getFullYear() &&
                c.date.getMonth() === day.getMonth() &&
                c.date.getDate() === day.getDate()
            );
            const hasContest = Boolean(dayContest);

            const dayAttendance = attendance.find(
              (a) =>
                a.date.getFullYear() === day.getFullYear() &&
                a.date.getMonth() === day.getMonth() &&
                a.date.getDate() === day.getDate()
            );
            const hasAttendance = Boolean(dayAttendance);

            const isCurrentDay = isToday(day);
            const isSelected =
              selectedDay &&
              selectedDay.getDate() === day.getDate() &&
              selectedDay.getMonth() === day.getMonth();

            // Background & border dynamic styling
            let cellStyle = "text-slate-300 border-white/5 hover:bg-white/5 hover:border-white/15";

            if (!isSameMonth(day, currentDate)) {
              cellStyle = "text-slate-600 border-transparent pointer-events-none";
            } else if (isCurrentDay) {
              cellStyle = "bg-purple-600 text-white font-bold border-purple-500 shadow-sm";
            } else if (isSelected) {
              cellStyle = "ring-1 ring-white bg-white/20 text-white border-white/30";
            } else if (dayAttendance && !dayAttendance.present) {
              // Missed class session - red highlight
              cellStyle = "bg-rose-500/15 border-rose-500/40 text-rose-200 hover:bg-rose-500/25";
            } else if (dayAttendance && dayAttendance.present) {
              // Attended class session - subtle green highlight
              cellStyle = "bg-emerald-500/10 border-emerald-500/30 text-white hover:bg-emerald-500/20";
            } else if (hasContest) {
              cellStyle = "bg-white/10 border-white/20 text-white hover:bg-white/20";
            }

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`relative flex aspect-square flex-col items-center justify-center text-xs font-sans font-semibold border transition-colors cursor-pointer ${cellStyle}`}
              >
                <span>{format(day, "d")}</span>

                {/* Indicator dots container */}
                <div className="absolute bottom-1 flex items-center justify-center gap-1">
                  {hasContest && (
                    <span
                      className={`h-1 w-1 rounded-full ${
                        isCurrentDay ? "bg-white" : "bg-purple-400"
                      }`}
                      title={`Contest: ${dayContest?.title}`}
                    />
                  )}
                  {dayAttendance && (
                    <span
                      className={`h-1 w-1 rounded-full ${
                        dayAttendance.present
                          ? "bg-emerald-400"
                          : "bg-rose-500 ring-1 ring-rose-400"
                      }`}
                      title={
                        dayAttendance.present
                          ? `Present in class (Batch ${dayAttendance.batch})`
                          : `Absent from class (Batch ${dayAttendance.batch})`
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
      <div className="mt-5 pt-3 border-t border-white/10">
        {selectedDay ? (
          <div className="bg-black/60 border border-white/15 p-3 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase">
                {format(selectedDay, "EEEE, MMM d, yyyy")}
              </span>
              <div className="flex items-center gap-1.5">
                {isToday(selectedDay) && (
                  <span className="bg-purple-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                    TODAY
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
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
                      <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircleIcon className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    )}
                    <span className="text-[10px] font-mono-tech font-bold uppercase tracking-wider text-slate-300">
                      CLASS SESSION • BATCH {selectedAttendance.batch}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">
                    {selectedAttendance.topic || "Marathon Class Session"}
                  </h4>
                </div>

                <span
                  className={`text-[10px] font-mono-tech font-bold px-2 py-0.5 rounded border shrink-0 ${
                    selectedAttendance.present
                      ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                      : "border-rose-500/50 bg-rose-500/20 text-rose-300"
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
                  <span className="text-[10px] font-mono-tech text-purple-300 block uppercase font-bold">
                    DAILY CHALLENGE • DAY {selectedContest.dayNumber}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate mt-0.5">
                    {selectedContest.title}
                  </h4>
                </div>
                <a
                  href={selectedContest.link}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-purple-600 hover:bg-purple-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shrink-0 transition-colors"
                >
                  Open →
                </a>
              </div>
            )}

            {!selectedAttendance && !selectedContest && (
              <p className="text-xs text-slate-400 py-1">
                No classes or contests scheduled on this date.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 bg-purple-600" />
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-purple-400" />
                <span>Contest</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <span>Absent</span>
              </div>
            </div>

            {userBatch && (
              <div className="text-[10px] font-mono-tech text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                <span>ASSIGNED BATCH:</span>
                <span className="text-emerald-400 font-bold">BATCH {userBatch}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
