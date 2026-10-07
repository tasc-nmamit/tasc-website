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
  Edit3Icon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface User {
  id: string;
  name: string | null;
  displayName?: string | null;
  email: string;
  image: string | null;
  role: string;
  isAiml: boolean;
  isLateral?: boolean;
  year: number | null;
  branch: string | null;
  bio?: string | null;
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

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formName, setFormName] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formUsn, setFormUsn] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formYear, setFormYear] = useState<number | "">("");
  const [formBranch, setFormBranch] = useState("");
  const [formIsAiml, setFormIsAiml] = useState(false);
  const [formIsLateral, setFormIsLateral] = useState(false);
  const [formHackerRank, setFormHackerRank] = useState("");
  const [formLeetCode, setFormLeetCode] = useState("");
  const [formGitHub, setFormGitHub] = useState("");
  const [formCareerIntent, setFormCareerIntent] = useState("");
  const [formSkills, setFormSkills] = useState("");
  const [formLanguages, setFormLanguages] = useState("");
  const [formBio, setFormBio] = useState("");
  const [savingUser, setSavingUser] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function openEditModal(user: User) {
    setEditingUser(user);
    setFormName(user.name || "");
    setFormDisplayName(user.displayName || "");
    setFormUsn(user.usn || "");
    setFormPhone(user.phone || "");
    setFormYear(user.year ?? "");
    setFormBranch(user.branch || "");
    setFormIsAiml(!!user.isAiml);
    setFormIsLateral(!!user.isLateral);
    setFormHackerRank(user.hackerrankUsername || "");
    setFormLeetCode(user.leetcodeProfile || "");
    setFormGitHub(user.githubProfile || "");
    setFormCareerIntent(user.careerIntent || "");
    setFormSkills((user.skills || []).join(", "));
    setFormLanguages((user.languages || []).join(", "));
    setFormBio(user.bio || "");
    setSaveError(null);
  }

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;

    setSavingUser(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          name: formName,
          displayName: formDisplayName,
          usn: formUsn,
          phone: formPhone,
          year: formYear === "" ? null : Number(formYear),
          branch: formBranch,
          isAiml: formIsAiml,
          isLateral: formIsLateral,
          hackerrankUsername: formHackerRank,
          leetcodeProfile: formLeetCode,
          githubProfile: formGitHub,
          careerIntent: formCareerIntent || null,
          skills: formSkills.split(",").map((s) => s.trim()).filter(Boolean),
          languages: formLanguages.split(",").map((l) => l.trim()).filter(Boolean),
          bio: formBio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user details");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...data.user } : u))
      );

      setEditingUser(null);
    } catch (err: any) {
      console.error("Save user error:", err);
      setSaveError(err.message || "Failed to save user details");
    } finally {
      setSavingUser(false);
    }
  }

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
                {/* Edit Student Details Button */}
                <button
                  type="button"
                  onClick={() => openEditModal(user)}
                  disabled={updating === user.id}
                  className="rounded-xl border border-brand/40 bg-brand/10 hover:bg-brand/20 text-brand-accent px-3 py-1.5 text-xs font-bold font-space-grotesk transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Edit Student Details"
                >
                  <Edit3Icon className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

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
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(user);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-accent/40 bg-brand-accent/15 hover:bg-brand-accent/25 text-xs font-mono-tech text-brand-accent transition-colors cursor-pointer"
                    >
                      <Edit3Icon className="w-3.5 h-3.5" />
                      Edit Student Details
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportUserHistory(user);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand/30 bg-card/60 hover:bg-card/90 text-xs font-mono-tech text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" />
                      Export History
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
      {/* EDIT STUDENT DETAILS MODAL */}
      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border border-brand/30 bg-card/95 text-foreground backdrop-blur-2xl p-6 sm:p-7 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-space-grotesk flex items-center gap-2">
              <Edit3Icon className="w-5 h-5 text-brand-accent" />
              <span>Edit Student Profile</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-mono-tech text-muted-foreground">
              Modify identity records, USN, college year, contact, and competitive coding handles for {editingUser?.email}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-5 mt-2">
            {saveError && (
              <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-space-grotesk">
                {saveError}
              </div>
            )}

            {/* Academic & Identity */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono-tech uppercase tracking-wider text-brand-accent border-b border-border/50 pb-1">
                1. Academic & Identity
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Display Name</label>
                  <input
                    type="text"
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                    placeholder="e.g. Rahul S"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">USN / Roll Number</label>
                  <input
                    type="text"
                    value={formUsn}
                    onChange={(e) => setFormUsn(e.target.value)}
                    placeholder="e.g. NN25AIM045 or 26DIPAM01"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground uppercase font-mono-tech outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Academic Year</label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                  >
                    <option value="">Unassigned</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Branch</label>
                  <input
                    type="text"
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    placeholder="e.g. AIML, CSE, ISE"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground select-none">
                  <input
                    type="checkbox"
                    checked={formIsAiml}
                    onChange={(e) => setFormIsAiml(e.target.checked)}
                    className="rounded border-border text-brand-accent focus:ring-brand-accent h-4 w-4"
                  />
                  <span>AIML Department Student</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground select-none">
                  <input
                    type="checkbox"
                    checked={formIsLateral}
                    onChange={(e) => setFormIsLateral(e.target.checked)}
                    className="rounded border-border text-brand-accent focus:ring-brand-accent h-4 w-4"
                  />
                  <span>Lateral Entry (Diploma) Student</span>
                </label>
              </div>
            </div>

            {/* Coding Profiles */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono-tech uppercase tracking-wider text-purple-400 border-b border-border/50 pb-1">
                2. Coding & Competitive Profiles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    HackerRank Username
                  </label>
                  <input
                    type="text"
                    value={formHackerRank}
                    onChange={(e) => setFormHackerRank(e.target.value)}
                    placeholder="username or URL"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-purple-400 font-mono-tech"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    LeetCode Profile
                  </label>
                  <input
                    type="text"
                    value={formLeetCode}
                    onChange={(e) => setFormLeetCode(e.target.value)}
                    placeholder="username or URL"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-purple-400 font-mono-tech"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    GitHub Profile
                  </label>
                  <input
                    type="text"
                    value={formGitHub}
                    onChange={(e) => setFormGitHub(e.target.value)}
                    placeholder="username or URL"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-purple-400 font-mono-tech"
                  />
                </div>
              </div>
            </div>

            {/* Career & Skills */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono-tech uppercase tracking-wider text-emerald-400 border-b border-border/50 pb-1">
                3. Career & Skills
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Career Intent
                  </label>
                  <select
                    value={formCareerIntent}
                    onChange={(e) => setFormCareerIntent(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-400"
                  >
                    <option value="">Unspecified</option>
                    <option value="PLACEMENT">Placement (Corporate Jobs)</option>
                    <option value="HIGHER_STUDIES">Higher Studies (MS / M.Tech / MBA)</option>
                    <option value="ENTREPRENEURSHIP">Entrepreneurship / Startup</option>
                    <option value="GOVERNMENT_EXAMS">Government Exams</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Technical Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formSkills}
                    onChange={(e) => setFormSkills(e.target.value)}
                    placeholder="e.g. React, Python, PyTorch, Docker"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Programming Languages (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formLanguages}
                    onChange={(e) => setFormLanguages(e.target.value)}
                    placeholder="e.g. Python, C++, Java, TypeScript"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={2}
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    placeholder="Short bio or summary..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingUser}
                className="rounded-lg bg-brand px-5 py-2 text-xs font-bold text-white hover:bg-brand/90 transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                {savingUser ? "Saving Changes..." : "Save Student Details"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
