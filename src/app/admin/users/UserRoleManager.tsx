"use client";

import { useState } from "react";
import Image from "next/image";
import { SearchIcon, ShieldCheckIcon, UserMinusIcon, Trash2Icon } from "lucide-react";

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
}

interface UserRoleManagerProps {
  users: User[];
}

export default function UserRoleManager({ users: initialUsers }: UserRoleManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");

  const filtered = users.filter((user) => {
    const searchTarget = `${user.name || ""} ${user.displayName || ""} ${user.email}`.toLowerCase();
    const matchesSearch = searchTarget.includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || user.role === filter;
    return matchesSearch && matchesFilter;
  });

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

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, display name, or NMAMIT email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-brand/30 bg-card/60 pl-10 pr-4 py-2.5 text-sm text-foreground backdrop-blur-md outline-none focus:border-brand-accent font-space-grotesk"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "ADMIN", "USER"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-4 py-2 text-xs font-bold font-mono-tech uppercase tracking-wider transition-all cursor-pointer ${
                filter === f
                  ? "bg-brand/20 text-brand-accent border border-brand/40 shadow-sm"
                  : "border border-brand/20 bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card/70"
              }`}
            >
              {f === "ALL" ? `ALL (${users.length})` : f}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filtered.map((user) => (
          <div
            key={user.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-brand/20 bg-card/70 backdrop-blur-xl p-4 sm:p-5 shadow-md transition-all hover:border-brand-accent/40"
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar */}
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || ""}
                  width={44}
                  height={44}
                  className="rounded-full border border-brand/30 shrink-0"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/20 border border-brand/30 text-sm font-bold font-mono-tech text-brand-accent shrink-0">
                  {(user.displayName || user.name || user.email)[0].toUpperCase()}
                </div>
              )}

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
                  {user.isAiml && (
                    <span className="rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/40 px-2 py-0.5 text-[10px] font-bold font-mono-tech uppercase tracking-wider">
                      AIML
                    </span>
                  )}
                </div>
                <p className="truncate text-xs font-mono-tech text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Actions */}
            {user.role !== "OWNER" && (
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
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
