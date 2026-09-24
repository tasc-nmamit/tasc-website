"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen,
} from "lucide-react";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";
import { MarathonBatch, BATCH_DETAILS, MARATHON_BATCHES } from "@/lib/marathon-batches";

interface Student {
  id: string;
  name: string | null;
  email: string;
  usn: string | null;
  year: number | null;
  branch: string | null;
  batch: MarathonBatch | null;
  marathonTotalScore?: number;
}

interface AttendanceRecord {
  id: string;
  classId: string;
  userId: string;
  batch: string;
  present: boolean;
  user: {
    id: string;
    name: string | null;
    email: string;
    usn: string | null;
    year: number | null;
    branch?: string | null;
  };
}

interface MarathonClass {
  id: string;
  date: string;
  batches: string[];
  topic: string | null;
  attendance: AttendanceRecord[];
}

interface AttendanceClientProps {
  initialClasses: MarathonClass[];
  students: Student[];
}

export default function AttendanceClient({
  initialClasses,
  students,
}: AttendanceClientProps) {
  const router = useRouter();
  const [classes, setClasses] = useState<MarathonClass[]>(initialClasses);

  // Calendar Navigation State
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    today.toISOString().split("T")[0]
  );

  // Active Class Selection
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    classes.length > 0 ? classes[0].id : null
  );

  // Scheduling Modal State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [schedDate, setSchedDate] = useState<string>(
    today.toISOString().split("T")[0]
  );
  const [schedBatches, setSchedBatches] = useState<MarathonBatch[]>([
    "2A",
    "2B",
    "3A1",
    "3A2",
  ]);
  const [schedTopic, setSchedTopic] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  // Attendance Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PRESENT" | "ABSENT">("ALL");
  const [isUpdatingAttendance, setIsUpdatingAttendance] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);

  // Derived selected class
  const selectedClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  // Calendar Computation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Map classes by YYYY-MM-DD
  const classesByDate = useMemo(() => {
    const map: Record<string, MarathonClass[]> = {};
    for (const c of classes) {
      const d = new Date(c.date).toISOString().split("T")[0];
      if (!map[d]) map[d] = [];
      map[d].push(c);
    }
    return map;
  }, [classes]);

  // Toggle single attendance record
  const handleToggleAttendance = async (attendanceId: string, currentStatus: boolean) => {
    if (!selectedClass) return;
    const newStatus = !currentStatus;

    // Optimistic UI update
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id !== selectedClass.id) return c;
        return {
          ...c,
          attendance: c.attendance.map((a) =>
            a.id === attendanceId ? { ...a, present: newStatus } : a
          ),
        };
      })
    );

    try {
      const res = await fetch(`/api/admin/marathon/attendance/${selectedClass.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceUpdates: [{ id: attendanceId, present: newStatus }],
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
    } catch (err: any) {
      alert("Failed to update attendance: " + err.message);
      // Revert on error
      router.refresh();
    }
  };

  // Bulk mark filtered students
  const handleBulkMark = async (present: boolean) => {
    if (!selectedClass || filteredAttendance.length === 0) return;
    setIsUpdatingAttendance(true);

    const updates = filteredAttendance.map((a) => ({
      id: a.id,
      present,
    }));

    // Optimistic update
    const updateMap = new Map(updates.map((u) => [u.id, u.present]));
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id !== selectedClass.id) return c;
        return {
          ...c,
          attendance: c.attendance.map((a) =>
            updateMap.has(a.id) ? { ...a, present: updateMap.get(a.id)! } : a
          ),
        };
      })
    );

    try {
      const res = await fetch(`/api/admin/marathon/attendance/${selectedClass.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceUpdates: updates }),
      });

      if (!res.ok) throw new Error(await res.text());
    } catch (err: any) {
      alert("Failed bulk update: " + err.message);
      router.refresh();
    } finally {
      setIsUpdatingAttendance(false);
    }
  };

  // Schedule New Class
  const handleScheduleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (schedBatches.length === 0) {
      alert("Please select at least one batch.");
      return;
    }

    setIsScheduling(true);
    try {
      const res = await fetch("/api/admin/marathon/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: schedDate,
          batches: schedBatches,
          topic: schedTopic,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule class");

      alert(`Class scheduled successfully! ${data.studentsCount} students marked present by default.`);
      setClasses((prev) => [data.class, ...prev]);
      setSelectedClassId(data.class.id);
      setSelectedDateStr(schedDate);
      setIsScheduleOpen(false);
      setSchedTopic("");
    } catch (err: any) {
      alert("Error scheduling class: " + err.message);
    } finally {
      setIsScheduling(false);
    }
  };

  // Delete Class
  const handleDeleteClass = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class and all its attendance records?")) {
      return;
    }

    setDeletingClassId(classId);
    try {
      const res = await fetch(`/api/admin/marathon/attendance/${classId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(await res.text());

      setClasses((prev) => prev.filter((c) => c.id !== classId));
      if (selectedClassId === classId) {
        setSelectedClassId(classes.find((c) => c.id !== classId)?.id || null);
      }
    } catch (err: any) {
      alert("Failed to delete class: " + err.message);
    } finally {
      setDeletingClassId(null);
    }
  };

  // Filtered attendance for currently selected class
  const filteredAttendance = useMemo(() => {
    if (!selectedClass) return [];
    return selectedClass.attendance.filter((rec) => {
      // Batch filter
      if (batchFilter !== "ALL" && rec.batch !== batchFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === "PRESENT" && !rec.present) return false;
      if (statusFilter === "ABSENT" && rec.present) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (rec.user.name || "").toLowerCase().includes(q);
        const usnMatch = (rec.user.usn || "").toLowerCase().includes(q);
        const emailMatch = rec.user.email.toLowerCase().includes(q);
        if (!nameMatch && !usnMatch && !emailMatch) return false;
      }
      return true;
    });
  }, [selectedClass, batchFilter, statusFilter, searchQuery]);

  // Overall counts for selected class
  const classStats = useMemo(() => {
    if (!selectedClass) return { total: 0, present: 0, absent: 0, percentage: 0 };
    const total = selectedClass.attendance.length;
    const present = selectedClass.attendance.filter((a) => a.present).length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, percentage };
  }, [selectedClass]);

  // Count enrolled students per batch in database
  const batchStudentCounts = useMemo(() => {
    const counts: Record<string, number> = { "2A": 0, "2B": 0, "3A1": 0, "3A2": 0 };
    for (const s of students) {
      if (s.batch && counts[s.batch] !== undefined) {
        counts[s.batch]++;
      }
    }
    return counts;
  }, [students]);

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* TOP HEADER & ACTION CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Classes */}
        <div className="rounded-2xl border border-brand/20 bg-background/60 backdrop-blur-md p-5 relative overflow-hidden">
          <CircuitTrace corners={true} />
          <span className="text-xs font-mono-tech text-brand-accent uppercase tracking-wider block">
            [ SESSIONS_SCHEDULED ]
          </span>
          <p className="mt-2 text-3xl font-extrabold font-space-grotesk text-foreground">
            {classes.length}
          </p>
          <span className="text-xs text-muted-foreground font-mono-tech mt-1 block">
            Total Marathon Classes
          </span>
        </div>

        {/* 2nd Year Batches */}
        <div className="rounded-2xl border border-brand/20 bg-background/60 backdrop-blur-md p-5 relative overflow-hidden">
          <CircuitTrace corners={true} />
          <span className="text-xs font-mono-tech text-gold uppercase tracking-wider block">
            [ 2ND_YEAR_AIML ]
          </span>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-sm font-space-grotesk font-semibold text-foreground">
              2A: <strong className="text-gold">{batchStudentCounts["2A"]}</strong>
            </span>
            <span className="text-sm font-space-grotesk font-semibold text-foreground">
              2B: <strong className="text-gold">{batchStudentCounts["2B"]}</strong>
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono-tech mt-1 block">
            USN: NN25AIM (1-144) & 26DIPAM
          </span>
        </div>

        {/* 3rd Year Batches */}
        <div className="rounded-2xl border border-brand/20 bg-background/60 backdrop-blur-md p-5 relative overflow-hidden">
          <CircuitTrace corners={true} />
          <span className="text-xs font-mono-tech text-purple-400 uppercase tracking-wider block">
            [ 3RD_YEAR_AIML ]
          </span>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-sm font-space-grotesk font-semibold text-foreground">
              3A1: <strong className="text-purple-400">{batchStudentCounts["3A1"]}</strong>
            </span>
            <span className="text-sm font-space-grotesk font-semibold text-foreground">
              3A2: <strong className="text-purple-400">{batchStudentCounts["3A2"]}</strong>
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono-tech mt-1 block">
            USN: NNM24AM & Lateral
          </span>
        </div>

        {/* Schedule Action Button */}
        <div className="rounded-2xl border border-brand/40 bg-gradient-to-br from-brand/20 via-brand/10 to-transparent p-5 flex flex-col justify-between relative overflow-hidden">
          <CircuitTrace corners={true} />
          <div>
            <span className="text-xs font-mono-tech text-brand-accent uppercase tracking-wider block">
              [ QUICK_ACTION ]
            </span>
            <h4 className="font-space-grotesk font-bold text-base text-foreground mt-1">
              Schedule Class
            </h4>
          </div>
          <button
            onClick={() => {
              setSchedDate(selectedDateStr || today.toISOString().split("T")[0]);
              setIsScheduleOpen(true);
            }}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand/90 px-4 py-2.5 font-space-grotesk font-bold text-xs uppercase tracking-wider text-white shadow-md shadow-brand/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ SCHEDULE_SESSION</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE CALENDAR & SCHEDULE SECTION */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-brand/20 bg-background/60 backdrop-blur-md p-6 relative">
        <CircuitTrace corners={true} />

        {/* Calendar Navigation Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-brand/15">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand/10 border border-brand/30 text-brand-accent">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-space-grotesk text-xl font-bold text-foreground">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <p className="text-xs font-mono-tech text-muted-foreground">
                Click any day to view or schedule marathon sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-brand/20 bg-background/80 hover:bg-card text-foreground transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentMonth(today.getMonth());
                setCurrentYear(today.getFullYear());
                setSelectedDateStr(today.toISOString().split("T")[0]);
              }}
              className="px-3 py-1.5 rounded-xl border border-brand/20 bg-background/80 hover:bg-card text-xs font-mono-tech text-foreground transition-colors cursor-pointer"
            >
              TODAY
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-brand/20 bg-background/80 hover:bg-card text-foreground transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 pt-4 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span
              key={day}
              className="text-[11px] font-mono-tech font-bold uppercase tracking-wider text-muted-foreground py-2"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {/* Leading blank days */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div
              key={`blank-${i}`}
              className="min-h-24 rounded-xl border border-transparent bg-card/10 opacity-30 pointer-events-none"
            />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const isToday =
              today.getFullYear() === currentYear &&
              today.getMonth() === currentMonth &&
              today.getDate() === dayNum;
            const isSelected = selectedDateStr === dateStr;
            const dayClasses = classesByDate[dateStr] || [];

            return (
              <div
                key={dateStr}
                onClick={() => {
                  setSelectedDateStr(dateStr);
                  if (dayClasses.length > 0) {
                    setSelectedClassId(dayClasses[0].id);
                  }
                }}
                className={`min-h-24 rounded-xl border p-2 flex flex-col justify-between transition-all cursor-pointer relative group ${
                  isSelected
                    ? "border-brand-accent bg-brand/10 shadow-md shadow-brand/10"
                    : isToday
                    ? "border-gold/50 bg-gold/5"
                    : dayClasses.length > 0
                    ? "border-brand/30 bg-card/60 hover:border-brand/50"
                    : "border-brand/10 bg-background/40 hover:bg-card/40 hover:border-brand/30"
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono-tech font-bold rounded-md px-1.5 py-0.5 ${
                      isToday
                        ? "bg-gold text-black"
                        : isSelected
                        ? "bg-brand text-white"
                        : "text-foreground"
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dayClasses.length === 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSchedDate(dateStr);
                        setIsScheduleOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-brand/20 text-brand-accent"
                      title="Schedule class on this day"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Scheduled Class Indicators */}
                <div className="mt-1 space-y-1">
                  {dayClasses.map((cls) => {
                    const presentCount = cls.attendance.filter((a) => a.present).length;
                    const totalCount = cls.attendance.length;

                    return (
                      <div
                        key={cls.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDateStr(dateStr);
                          setSelectedClassId(cls.id);
                        }}
                        className={`rounded-lg p-1.5 text-[10px] font-space-grotesk border transition-all ${
                          selectedClassId === cls.id
                            ? "bg-brand text-white border-brand shadow-sm"
                            : "bg-brand/15 text-brand-accent border-brand/25 hover:bg-brand/25"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="truncate">{cls.topic || "Class"}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 font-mono-tech text-[9px] opacity-90">
                          <span>{cls.batches.join(", ")}</span>
                          <span>•</span>
                          <span>{presentCount}/{totalCount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ATTENDANCE ROLL-CALL & STUDENT ROSTER */}
      {/* ========================================================================= */}
      {selectedClass ? (
        <div className="rounded-2xl border border-brand/20 bg-background/60 backdrop-blur-md p-6 space-y-6 relative">
          <CircuitTrace corners={true} />

          {/* Class Header Banner */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-brand/15">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono-tech text-xs text-brand-accent uppercase tracking-widest">
                  [ SESSION_DETAILS // {new Date(selectedClass.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" })} ]
                </span>
              </div>
              <h3 className="text-2xl font-bold font-space-grotesk text-foreground">
                {selectedClass.topic || "Marathon Class Session"}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs font-mono-tech text-muted-foreground uppercase">
                  Batches:
                </span>
                {selectedClass.batches.map((b) => (
                  <span
                    key={b}
                    className="rounded-md border border-brand/30 bg-brand/15 px-2 py-0.5 text-xs font-mono-tech font-bold text-brand-accent"
                  >
                    Batch {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Action: Delete Class */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDeleteClass(selectedClass.id)}
                disabled={deletingClassId === selectedClass.id}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-mono-tech text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deletingClassId === selectedClass.id ? "DELETING..." : "DELETE_CLASS"}</span>
              </button>
            </div>
          </div>

          {/* Attendance Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-brand/20 bg-card/40 p-4 text-center">
              <span className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-widest block">
                TOTAL ENROLLED
              </span>
              <p className="text-2xl font-extrabold font-space-grotesk text-foreground mt-1">
                {classStats.total}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <span className="text-[10px] font-mono-tech text-emerald-400 uppercase tracking-widest block">
                PRESENT (DEFAULT)
              </span>
              <p className="text-2xl font-extrabold font-space-grotesk text-emerald-400 mt-1">
                {classStats.present}
              </p>
            </div>

            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
              <span className="text-[10px] font-mono-tech text-red-400 uppercase tracking-widest block">
                ABSENT
              </span>
              <p className="text-2xl font-extrabold font-space-grotesk text-red-400 mt-1">
                {classStats.absent}
              </p>
            </div>

            <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 text-center">
              <span className="text-[10px] font-mono-tech text-gold uppercase tracking-widest block">
                ATTENDANCE RATE
              </span>
              <p className="text-2xl font-extrabold font-space-grotesk text-gold mt-1">
                {classStats.percentage}%
              </p>
            </div>
          </div>

          {/* Control Bar: Filters, Search, Bulk Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Batch Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setBatchFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                    batchFilter === "ALL"
                      ? "bg-brand text-white font-bold"
                      : "bg-card/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Batches ({selectedClass.attendance.length})
                </button>
                {selectedClass.batches.map((b) => {
                  const count = selectedClass.attendance.filter((a) => a.batch === b).length;
                  return (
                    <button
                      key={b}
                      onClick={() => setBatchFilter(b)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                        batchFilter === b
                          ? "bg-brand text-white font-bold"
                          : "bg-card/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Batch {b} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Bulk Toggle Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkMark(true)}
                  disabled={isUpdatingAttendance}
                  className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono-tech text-emerald-300 transition-colors cursor-pointer"
                >
                  ✓ Mark Filtered Present
                </button>
                <button
                  onClick={() => handleBulkMark(false)}
                  disabled={isUpdatingAttendance}
                  className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-mono-tech text-red-300 transition-colors cursor-pointer"
                >
                  ✗ Mark Filtered Absent
                </button>
              </div>
            </div>

            {/* Search and Status Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search student by name, USN, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-brand/20 bg-card/60 pl-9 pr-4 py-2 text-xs text-foreground outline-none focus:border-brand-accent font-space-grotesk"
                />
              </div>

              <div className="flex items-center gap-2">
                {(["ALL", "PRESENT", "ABSENT"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech uppercase transition-all cursor-pointer ${
                      statusFilter === st
                        ? "bg-muted text-foreground font-bold border border-brand/30"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Student Attendance Cards Grid */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono-tech text-muted-foreground px-2 pb-1">
              <span>Showing {filteredAttendance.length} students</span>
              <span className="italic">Click badge to toggle Present / Absent</span>
            </div>

            {filteredAttendance.length === 0 ? (
              <div className="rounded-xl border border-brand/20 bg-card/30 p-8 text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-space-grotesk text-muted-foreground">
                  No students match the current filters or search query.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredAttendance.map((record) => {
                  const isPresent = record.present;

                  return (
                    <div
                      key={record.id}
                      onClick={() => handleToggleAttendance(record.id, isPresent)}
                      className={`group rounded-xl border p-3.5 flex items-center justify-between transition-all cursor-pointer select-none ${
                        isPresent
                          ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                          : "border-red-500/30 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/50"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs font-space-grotesk text-foreground truncate block">
                            {record.user.name || record.user.email}
                          </span>
                          <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded border border-brand/30 bg-brand/10 text-brand-accent shrink-0">
                            {record.batch}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono-tech text-muted-foreground block truncate mt-0.5">
                          {record.user.usn || record.user.email}
                        </span>
                      </div>

                      {/* Clickable Status Badge */}
                      <div className="shrink-0">
                        {isPresent ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 group-hover:bg-emerald-500/30 transition-all font-mono-tech text-xs font-bold shadow-sm shadow-emerald-500/10">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>PRESENT</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 group-hover:bg-red-500/30 transition-all font-mono-tech text-xs font-bold shadow-sm shadow-red-500/10">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>ABSENT</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-brand/20 bg-background/60 backdrop-blur-md p-12 text-center relative">
          <CircuitTrace corners={true} />
          <CalendarIcon className="w-12 h-12 text-brand-accent/50 mx-auto mb-3" />
          <h3 className="text-lg font-bold font-space-grotesk text-foreground">
            No Marathon Class Selected
          </h3>
          <p className="text-xs text-muted-foreground font-mono-tech mt-1 max-w-md mx-auto">
            Select a scheduled class from the calendar above or schedule a new marathon session to manage student attendance.
          </p>
          <button
            onClick={() => {
              setSchedDate(selectedDateStr || today.toISOString().split("T")[0]);
              setIsScheduleOpen(true);
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand hover:bg-brand/90 px-4 py-2 font-space-grotesk font-bold text-xs uppercase tracking-wider text-white shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session for Selected Day</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCHEDULE CLASS MODAL */}
      {/* ========================================================================= */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-brand/30 bg-background/95 p-6 shadow-2xl relative overflow-hidden">
            <CircuitTrace corners={true} />

            <div className="flex items-center justify-between pb-4 border-b border-brand/15">
              <div>
                <span className="font-mono-tech text-xs text-brand-accent uppercase tracking-widest block">
                  [ NEW_CLASS // SCHEDULE ]
                </span>
                <h3 className="font-space-grotesk text-xl font-bold text-foreground">
                  Schedule Marathon Class
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-card hover:text-foreground transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleClass} className="space-y-4 pt-4">
              {/* Date Input */}
              <div>
                <label className="block text-xs font-mono-tech text-muted-foreground uppercase mb-1">
                  Class Date *
                </label>
                <input
                  type="date"
                  required
                  value={schedDate}
                  onChange={(e) => setSchedDate(e.target.value)}
                  className="w-full rounded-xl border border-brand/30 bg-card px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent font-space-grotesk"
                />
              </div>

              {/* Topic Input */}
              <div>
                <label className="block text-xs font-mono-tech text-muted-foreground uppercase mb-1">
                  Topic / Session Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Graph Theory, Dynamic Programming, Strings..."
                  value={schedTopic}
                  onChange={(e) => setSchedTopic(e.target.value)}
                  className="w-full rounded-xl border border-brand/30 bg-card px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent font-space-grotesk"
                />
              </div>

              {/* Batch Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono-tech text-muted-foreground uppercase">
                    Select Target Batches *
                  </label>
                  <div className="flex items-center gap-2 text-[10px] font-mono-tech">
                    <button
                      type="button"
                      onClick={() => setSchedBatches(["2A", "2B", "3A1", "3A2"])}
                      className="text-brand-accent hover:underline cursor-pointer"
                    >
                      All Batches
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSchedBatches(["2A", "2B"])}
                      className="text-gold hover:underline cursor-pointer"
                    >
                      Year 2
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSchedBatches(["3A1", "3A2"])}
                      className="text-purple-400 hover:underline cursor-pointer"
                    >
                      Year 3
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MARATHON_BATCHES.map((batchKey) => {
                    const info = BATCH_DETAILS[batchKey];
                    const isChecked = schedBatches.includes(batchKey);
                    const count = batchStudentCounts[batchKey] || 0;

                    return (
                      <label
                        key={batchKey}
                        className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                          isChecked
                            ? "border-brand-accent bg-brand/10"
                            : "border-brand/20 bg-card/40 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSchedBatches([...schedBatches, batchKey]);
                            } else {
                              setSchedBatches(schedBatches.filter((b) => b !== batchKey));
                            }
                          }}
                          className="mt-1 rounded border-brand/30 text-brand focus:ring-brand-accent"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-space-grotesk font-bold text-xs text-foreground">
                              {info.label}
                            </span>
                            <span className="font-mono-tech text-[10px] text-muted-foreground">
                              {count} students
                            </span>
                          </div>
                          <p className="text-[10px] font-mono-tech text-muted-foreground truncate mt-0.5">
                            {info.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Informative Note */}
              <div className="rounded-xl border border-brand/20 bg-brand/5 p-3 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                <p className="text-xs font-mono-tech text-muted-foreground leading-relaxed">
                  <strong>Default Present:</strong> Scheduling this class will automatically mark all enrolled students in the selected batches as <strong>Present</strong>. You can click on any student afterward to mark them as Absent.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="flex-1 rounded-xl border border-brand/25 bg-card/50 py-2.5 text-xs font-space-grotesk font-semibold text-foreground hover:bg-card transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="flex-1 rounded-xl bg-brand hover:bg-brand/90 py-2.5 text-xs font-space-grotesk font-bold uppercase tracking-wider text-white shadow-lg shadow-brand/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isScheduling ? "Scheduling..." : "Schedule Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
