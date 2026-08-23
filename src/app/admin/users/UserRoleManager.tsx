"use client";

import { useState } from "react";
import Image from "next/image";

interface User {
  id: string;
  name: string | null;
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

const ROLE_STYLES: Record<string, string> = {
  OWNER: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  ADMIN: "bg-gradient-to-r from-purple-500 to-brand text-white",
  USER: "bg-muted text-muted-foreground",
};

export default function UserRoleManager({ users: initialUsers }: UserRoleManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");

  const filtered = users.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
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
      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "ADMIN", "USER"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                filter === f
                  ? "bg-brand text-white shadow-md shadow-brand/25"
                  : "border border-border bg-background text-foreground hover:bg-accent/50"
              }`}
            >
              {f === "ALL" ? `All (${users.length})` : f}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filtered.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-4 rounded-xl border border-border/50 bg-background/80 p-4 backdrop-blur-sm transition-all hover:border-brand/20 hover:shadow-md"
          >
            {/* Avatar */}
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || ""}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20 text-sm font-bold text-brand">
                {(user.name || user.email)[0].toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-foreground">
                  {user.name || "Unnamed"}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    ROLE_STYLES[user.role] || ROLE_STYLES.USER
                  }`}
                >
                  {user.role}
                </span>
                {user.isAiml && (
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                    AIML
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>

            {/* Actions */}
            {user.role !== "OWNER" && (
              <div className="flex gap-2">
                {user.role === "USER" ? (
                  <button
                    onClick={() => updateRole(user.id, "ADMIN")}
                    disabled={updating === user.id}
                    className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-500 transition-all hover:bg-purple-500/20 disabled:opacity-50"
                  >
                    {updating === user.id ? "..." : "Make Admin"}
                  </button>
                ) : (
                  <button
                    onClick={() => updateRole(user.id, "USER")}
                    disabled={updating === user.id}
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-500 transition-all hover:bg-amber-500/20 disabled:opacity-50"
                  >
                    {updating === user.id ? "..." : "Remove Admin"}
                  </button>
                )}
                <button
                  onClick={() => deleteUser(user.id)}
                  disabled={updating === user.id}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-500/20 disabled:opacity-50"
                >
                  {updating === user.id ? "..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No users found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
