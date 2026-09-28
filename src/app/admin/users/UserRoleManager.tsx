"use client";

import { useState } from "react";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  SearchIcon,
  ShieldCheckIcon,
  UserMinusIcon,
  Trash2Icon,
  DownloadIcon,
  CpuIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  displayName?: string | null;
  email: string;
  image: string | null;
  role: string;
  isAiml: boolean;
  year: number | null;
  branch: string | null;
  onboardingComplete: boolean;
  createdAt: Date;
  marathonAttendance?: any[];
  marathonDailyScores?: any[];
  marathonWeeklyScores?: any[];
  hackerrankUsername?: string | null;
  leetcodeProfile?: string | null;
  githubProfile?: string | null;
  careerIntent?: string | null;
  phone?: string | null;
  usn?: string | null;
  skills?: string[];
  languages?: string[];
}

interface UserRoleManagerProps {
  users: User[];
  isOwner?: boolean;
}

export default function UserRoleManager({ users: initialUsers, isOwner = true }: UserRoleManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "AIML" | "NON_AIML" | "ADMIN">("ALL");

  const filtered = users.filter((user) => {
    const searchTarget = `${user.name || ""} ${user.displayName || ""} ${user.email} ${user.usn || ""}`.toLowerCase();
    const matchesSearch = searchTarget.includes(search.toLowerCase());
    let matchesFilter = true;
    if (filter === "AIML") matchesFilter = !!user.isAiml;
    else if (filter === "NON_AIML") matchesFilter = !user.isAiml;
    else if (filter === "ADMIN") matchesFilter = user.role === "ADMIN" || user.role === "OWNER";
    return matchesSearch && matchesFilter;
  });

  async function toggleAiml(userId: string, newAiml: boolean) {
    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isAiml: newAiml }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update AIML status");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isAiml: newAiml } : u))
      );
    } catch (err: any) {
      console.error("Failed to toggle AIML status:", err);
      alert("Failed to toggle AIML status: " + err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function updateRole(userId: string, newRole: "ADMIN" | "USER") {
    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Failed to update user role");
    } finally {
      setUpdating(null);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to completely remove this user? This cannot be undone.")) return;

    setUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user");
    } finally {
      setUpdating(null);
    }
  }

  const exportUserHistory = (user: User) => {
    const rows = [
      ["Type", "Date/ID", "Topic/Title", "Status/Score"]
    ];

    // Classes
    user.marathonAttendance?.forEach(a => {
      rows.push([
        "Class", 
        a.class?.date || "N/A", 
        `"${a.class?.topic || "No Topic"}"`, 
        a.present ? "Present" : "Absent"
      ]);
    });

    // Daily
    user.marathonDailyScores?.forEach(s => {
      rows.push([
        "Daily Contest", 
        s.contest?.date || "N/A", 
        `"${s.contest?.title || "Daily Problem"}"`, 
        `Score: ${s.score}`
      ]);
    });

    // Weekly
    user.marathonWeeklyScores?.forEach(w => {
      rows.push([
        "Weekly Contest", 
        w.contest ? `Week ${w.contest.weekNumber}` : "N/A", 
        `"${w.contest?.title || "Weekly Contest"}"`, 
        `Score: ${w.score}, Solved: ${w.solvedCount}, Rank: ${w.rank || "N/A"}`
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${user.usn || user.name || "user"}_marathon_history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(encodedUri);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, display name, USN, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-brand/30 bg-card/60 pl-10 pr-4 py-2.5 text-sm text-foreground backdrop-blur-md outline-none focus:border-brand-accent font-space-grotesk"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "ALL", label: `ALL (${users.length})` },
            { id: "AIML", label: `AIML (${users.filter((u) => u.isAiml).length})` },
            { id: "NON_AIML", label: `NON-AIML (${users.filter((u) => !u.isAiml).length})` },
            { id: "ADMIN", label: `ADMINS (${users.filter((u) => u.role === "ADMIN" || u.role === "OWNER").length})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold font-mono-tech uppercase tracking-wider transition-all cursor-pointer ${
                filter === f.id
                  ? "bg-brand/20 text-brand-accent border border-brand/40 shadow-sm"
                  : "border border-brand/20 bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filtered.map((user) => (
          <div
            key={user.id}
            className={`flex flex-col gap-4 rounded-2xl border ${
              expandedUserId === user.id ? "border-brand-accent shadow-lg bg-card/80" : "border-brand/20 bg-card/70 hover:border-brand-accent/40 shadow-md"
            } backdrop-blur-xl transition-all cursor-pointer overflow-hidden`}
            onClick={() => setExpandedUserId((prev) => (prev === user.id ? null : user.id))}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 pb-0 sm:pb-5">
              <div className="flex items-center gap-4 min-w-0">
                {/* Robust User Avatar with no-referrer, unoptimized, and error fallback */}
                <UserAvatar
                  src={user.image}
                  name={user.displayName || user.name}
                  email={user.email}
                  size={44}
                  className="rounded-full border border-brand/30 shrink-0"
                />

                {/* Info */}
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-bold font-space-grotesk text-foreground">
                      {user.displayName || user.name || "Unnamed Student"}
                    </p>
                    <span
                      className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold font-mono-tech uppercase tracking-wider border ${
                        user.role === "OWNER"
                          ? "bg-gold/15 text-gold border-gold/40"
                          : user.role === "ADMIN"
                          ? "bg-purple-500/15 text-purple-400 border-purple-500/40"
                          : "bg-muted text-muted-foreground border-border/40"
                      }`}
                    >
                      {user.role}
                    </span>

                    {/* Interactive AIML Status Badge */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAiml(user.id, !user.isAiml);
                      }}
                      disabled={updating === user.id}
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold font-mono-tech uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1 ${
                        user.isAiml
                          ? "bg-blue-500/15 text-blue-400 border-blue-500/40 hover:bg-blue-500/25"
                          : "bg-muted text-muted-foreground border-border/40 hover:border-blue-500/30 hover:text-blue-400"
                      }`}
                      title={user.isAiml ? "Click to toggle Non-AIML" : "Click to toggle AIML"}
                    >
                      <CpuIcon className="w-2.5 h-2.5" />
                      {user.isAiml ? "AIML" : "NON-AIML"}
                    </button>
                  </div>
                  <p className="truncate text-xs font-mono-tech text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div 
                className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-auto mb-4 sm:mb-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* AIML Toggle Action Button */}
                <button
                  onClick={() => toggleAiml(user.id, !user.isAiml)}
                  disabled={updating === user.id}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold font-space-grotesk transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer ${
                    user.isAiml
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                      : "border-border/60 bg-muted/60 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30"
                  }`}
                  title={user.isAiml ? "Mark as Non-AIML" : "Mark as AIML"}
                >
                  <CpuIcon className="w-3.5 h-3.5" />
                  {updating === user.id ? "Updating..." : user.isAiml ? "AIML ✓" : "Set AIML"}
                </button>

                {isOwner && user.role !== "OWNER" && (
                  <>
                    {user.role === "USER" ? (
                      <button
                        onClick={() => updateRole(user.id, "ADMIN")}
                        disabled={updating === user.id}
                        className="rounded-xl border border-brand/30 bg-brand/15 px-3.5 py-1.5 text-xs font-bold font-space-grotesk text-brand-accent transition-all hover:bg-brand/25 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <ShieldCheckIcon className="w-3.5 h-3.5" />
                        {updating === user.id ? "Updating..." : "Make Admin"}
                      </button>
                    ) : (
                      <button
                        onClick={() => updateRole(user.id, "USER")}
                        disabled={updating === user.id}
                        className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold font-space-grotesk text-amber-400 transition-all hover:bg-amber-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserMinusIcon className="w-3.5 h-3.5" />
                        {updating === user.id ? "Updating..." : "Revoke Admin"}
                      </button>
                    )}

                    <button
                      onClick={() => deleteUser(user.id)}
                      disabled={updating === user.id}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50 cursor-pointer"
                      title="Delete User"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Expandable Details Section */}
            {expandedUserId === user.id && (
              <div 
                className="px-4 sm:px-5 pb-5 pt-3 border-t border-brand/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-wider">Contact & Academic</p>
                  <p className="text-xs font-medium font-space-grotesk text-foreground">Phone: {user.phone || "N/A"}</p>
                  <p className="text-xs font-medium font-space-grotesk text-foreground">USN: {user.usn || "N/A"}</p>
                  <p className="text-xs font-medium font-space-grotesk text-foreground">Branch: {user.branch || "N/A"} - {user.year ? `Year ${user.year}` : "N/A"}</p>
                  
                  {/* AIML Toggle in Details */}
                  <div className="pt-2">
                    <button
                      onClick={() => toggleAiml(user.id, !user.isAiml)}
                      disabled={updating === user.id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono-tech cursor-pointer transition-colors ${
                        user.isAiml
                          ? "border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                          : "border-border/60 bg-muted/60 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30"
                      }`}
                    >
                      {user.isAiml ? <CheckCircle2Icon className="w-3.5 h-3.5 text-blue-400" /> : <XCircleIcon className="w-3.5 h-3.5" />}
                      <span>{user.isAiml ? "AIML Member (Click to Toggle)" : "Non-AIML (Click to Toggle)"}</span>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-wider">Profiles</p>
                  <p className="text-xs font-medium font-space-grotesk text-foreground flex gap-1">
                    <span className="text-muted-foreground">GitHub:</span>
                    {user.githubProfile ? (
                      <a href={user.githubProfile.startsWith("http") ? user.githubProfile : `https://github.com/${user.githubProfile}`} target="_blank" rel="noreferrer" className="text-brand-accent hover:underline truncate">
                        {user.githubProfile.split("/").pop()}
                      </a>
                    ) : "N/A"}
                  </p>
                  <p className="text-xs font-medium font-space-grotesk text-foreground flex gap-1">
                    <span className="text-muted-foreground">HackerRank:</span>
                    {user.hackerrankUsername ? (
                      <a href={`https://hackerrank.com/${user.hackerrankUsername}`} target="_blank" rel="noreferrer" className="text-brand-accent hover:underline truncate">
                        {user.hackerrankUsername}
                      </a>
                    ) : "N/A"}
                  </p>
                  <p className="text-xs font-medium font-space-grotesk text-foreground flex gap-1">
                    <span className="text-muted-foreground">LeetCode:</span>
                    {user.leetcodeProfile ? (
                      <a href={user.leetcodeProfile.startsWith("http") ? user.leetcodeProfile : `https://leetcode.com/u/${user.leetcodeProfile}`} target="_blank" rel="noreferrer" className="text-brand-accent hover:underline truncate">
                        {user.leetcodeProfile.split("/").pop()}
                      </a>
                    ) : "N/A"}
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2 md:col-span-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-wider">Intent & Skills</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium font-space-grotesk text-muted-foreground">Career Intent:</span>
                      <span className="px-2 py-0.5 rounded bg-brand/10 text-brand-accent border border-brand/20 text-[10px] font-mono-tech uppercase">
                        {user.careerIntent?.replace("_", " ") || "UNSPECIFIED"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(user.skills || []).slice(0, 5).map((skill) => (
                        <span key={skill} className="px-1.5 py-0.5 rounded bg-card/80 border border-border text-[10px] text-foreground">{skill}</span>
                      ))}
                      {(user.skills?.length || 0) > 5 && (
                        <span className="px-1.5 py-0.5 rounded bg-card/80 border border-border text-[10px] text-muted-foreground">+{user.skills!.length - 5}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportUserHistory(user);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-accent/30 bg-brand-accent/10 hover:bg-brand-accent/20 text-xs font-mono-tech text-brand-accent transition-colors cursor-pointer"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" />
                      Export Marathon History
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-brand/20 bg-card/60 backdrop-blur-xl p-12 text-center text-sm text-muted-foreground font-space-grotesk">
            No users found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
