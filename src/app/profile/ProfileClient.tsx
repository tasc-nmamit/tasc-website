"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";

export default function ProfileClient({ user }: { user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    bio: user.bio || "",
    hackerrankUsername: user.hackerrankUsername || "",
    leetcodeProfile: user.leetcodeProfile || "",
    githubProfile: user.githubProfile || "",
    careerIntent: user.careerIntent || "PLACEMENT",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }

      alert("Profile updated successfully!");
      router.refresh();
    } catch (err: any) {
      alert("Error updating profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative space-y-6 rounded-xl border border-brand/30 bg-card p-6 md:p-8 shadow-2xl bg-blueprint-grid">
      <CircuitTrace corners={true} />

      <div className="relative z-10 grid gap-6 sm:grid-cols-2 font-space-grotesk">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-space-grotesk text-foreground"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-mono-tech text-foreground"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">Career Intent (AIML)</label>
          <select
            name="careerIntent"
            value={formData.careerIntent}
            onChange={handleChange}
            className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-space-grotesk text-foreground"
          >
            <option value="PLACEMENT">Will sit for placements</option>
            <option value="NO">Will not sit for placements</option>
            <option value="HIGHER_STUDIES">Will take higher studies</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">HackerRank Username</label>
          <input
            type="text"
            name="hackerrankUsername"
            value={formData.hackerrankUsername}
            onChange={handleChange}
            placeholder="e.g. johndoe123"
            className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-mono-tech text-foreground"
          />
          <p className="mt-1 text-[11px] font-mono-tech text-gold">Required for Marathon score syncing</p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">LeetCode Profile URL</label>
          <input
            type="url"
            name="leetcodeProfile"
            value={formData.leetcodeProfile}
            onChange={handleChange}
            placeholder="https://leetcode.com/u/..."
            className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-mono-tech text-foreground"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">GitHub Profile URL</label>
          <input
            type="url"
            name="githubProfile"
            value={formData.githubProfile}
            onChange={handleChange}
            placeholder="https://github.com/..."
            className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-mono-tech text-foreground"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">Bio / Statement</label>
          <textarea
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-space-grotesk text-foreground"
          />
        </div>
      </div>

      <div className="relative z-10 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-accent px-6 py-3 font-space-grotesk font-semibold text-white tracking-wider uppercase transition-colors hover:bg-purple-600 disabled:opacity-50 shadow-lg cursor-pointer"
        >
          {loading ? "SAVING_PROFILE..." : "SAVE PROFILE"}
        </button>
      </div>
    </form>
  );
}
