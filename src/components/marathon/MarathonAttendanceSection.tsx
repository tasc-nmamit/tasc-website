"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2Icon, XCircleIcon, FilterIcon } from "lucide-react";

export interface AttendanceRecordItem {
  id: string;
  classId: string;
  present: boolean;
  batch: string;
  class: {
    id: string;
    date: Date | string;
    topic: string | null;
    batches: string[];
  };
}

interface MarathonAttendanceSectionProps {
  records: AttendanceRecordItem[];
  userBatch?: string | null;
  overallPercentage: number;
  overallPresent: number;
  overallTotal: number;
}

export default function MarathonAttendanceSection({
  records,
  userBatch,
  overallPercentage,
  overallPresent,
  overallTotal,
}: MarathonAttendanceSectionProps) {
  // Extract all unique month-year strings from records (e.g. "2026-10", "2026-09")
  const availableMonths = useMemo(() => {
    const monthMap = new Map<string, { label: string; date: Date }>();
    records.forEach((r) => {
      const d = new Date(r.class.date);
      const key = format(d, "yyyy-MM");
      if (!monthMap.has(key)) {
        monthMap.set(key, {
          label: format(d, "MMMM yyyy"),
          date: d,
        });
      }
    });

    // Sort newest month first
    return Array.from(monthMap.entries()).sort(
      (a, b) => b[1].date.getTime() - a[1].date.getTime()
    );
  }, [records]);

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("ALL");

  // Filter records based on selected month
  const filteredRecords = useMemo(() => {
    if (selectedMonthKey === "ALL") return records;
    return records.filter((r) => format(new Date(r.class.date), "yyyy-MM") === selectedMonthKey);
  }, [records, selectedMonthKey]);

  // Compute month-specific stats
  const activeStats = useMemo(() => {
    if (selectedMonthKey === "ALL") {
      return {
        label: "All Time",
        percentage: overallPercentage,
        present: overallPresent,
        total: overallTotal,
      };
    }
    const foundMonth = availableMonths.find(([k]) => k === selectedMonthKey);
    const total = filteredRecords.length;
    const present = filteredRecords.filter((r) => r.present).length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

    return {
      label: foundMonth ? foundMonth[1].label : selectedMonthKey,
      percentage,
      present,
      total,
    };
  }, [selectedMonthKey, filteredRecords, overallPercentage, overallPresent, overallTotal, availableMonths]);

  return (
    <section className="space-y-4">
      {/* Header with Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-valley text-xl sm:text-2xl font-bold tracking-tight text-foreground dark:text-white">
              Class Attendance & Sessions
            </h2>
            {userBatch && (
              <span className="text-[10px] font-mono-tech font-bold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:bg-purple-600/30 dark:border-purple-500/50 dark:text-purple-300">
                BATCH {userBatch}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground dark:text-slate-400 mt-0.5">
            View attendance logs and class history for current and previous months.
          </p>
        </div>

        {/* Dynamic Percentage Badge */}
        <div className="text-xs font-mono-tech text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 rounded-lg self-start sm:self-auto flex items-center gap-2 shadow-xs">
          <span className="font-bold text-sm">{activeStats.percentage}%</span>
          <span className="text-[11px] text-muted-foreground dark:text-slate-300">
            ({activeStats.present}/{activeStats.total} Classes Present • {activeStats.label})
          </span>
        </div>
      </div>

      {/* Month Filter Selector Tabs */}
      {availableMonths.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => setSelectedMonthKey("ALL")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-tech uppercase font-bold transition-all shrink-0 border cursor-pointer ${
              selectedMonthKey === "ALL"
                ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                : "bg-card/70 border-border dark:border-white/15 text-muted-foreground hover:text-foreground hover:bg-card"
            }`}
          >
            All Sessions ({records.length})
          </button>

          {availableMonths.map(([key, item]) => {
            const count = records.filter((r) => format(new Date(r.class.date), "yyyy-MM") === key).length;
            const isSelected = selectedMonthKey === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMonthKey(key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-tech uppercase font-bold transition-all shrink-0 border cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                    : "bg-card/70 border-border dark:border-white/15 text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-muted dark:bg-white/10 text-muted-foreground"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Records Grid */}
      <div className="border border-border dark:border-white/20 bg-card/90 dark:bg-black/75 backdrop-blur-md p-5 shadow-sm rounded-xl">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground dark:text-slate-400 text-xs space-y-1">
            <p className="font-semibold text-foreground dark:text-slate-300">
              No class sessions found {selectedMonthKey !== "ALL" ? `for ${activeStats.label}` : ""}.
            </p>
            <p className="text-muted-foreground dark:text-slate-500">
              When marathon mentoring sessions or lectures are scheduled, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className={`p-3.5 border rounded-lg flex items-center justify-between gap-3 transition-all ${
                  rec.present
                    ? "border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/5 hover:border-emerald-500/50"
                    : "border-red-500/30 bg-red-500/10 dark:bg-red-500/5 hover:border-red-500/50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono-tech text-muted-foreground dark:text-slate-400 block">
                    {format(new Date(rec.class.date), "EEEE, MMM d, yyyy")}
                  </span>
                  <h4 className="text-xs font-bold text-foreground dark:text-white truncate mt-0.5" title={rec.class.topic || "Marathon Class Session"}>
                    {rec.class.topic || "Marathon Class Session"}
                  </h4>
                  <span className="text-[10px] font-mono-tech text-purple-600 dark:text-purple-400">
                    Batch {rec.batch}
                  </span>
                </div>

                <span
                  className={`shrink-0 text-[10px] font-mono-tech font-bold px-2.5 py-1 rounded border flex items-center gap-1 ${
                    rec.present
                      ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "border-red-500/40 bg-red-500/20 text-red-700 dark:text-red-300"
                  }`}
                >
                  {rec.present ? (
                    <>
                      <CheckCircle2Icon className="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
                      <span>PRESENT</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-3 h-3 text-red-600 dark:text-red-300" />
                      <span>ABSENT</span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
