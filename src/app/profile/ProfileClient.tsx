"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border/50 bg-background/80 p-8 shadow-xl backdrop-blur-xl">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Career Plan (AIML Only)</label>
          <select
            name="careerIntent"
            value={formData.careerIntent}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-brand"
          >
            <option value="PLACEMENT">Will sit for placements</option>
            <option value="NO">Will not sit for placements</option>
            <option value="HIGHER_STUDIES">Will take higher studies</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium">HackerRank Username</label>
          <input
            type="text"
            name="hackerrankUsername"
            value={formData.hackerrankUsername}
            onChange={handleChange}
            placeholder="e.g. johndoe123"
            className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-brand"
          />
          <p className="mt-1 text-xs text-muted-foreground">This is required for Marathon score syncing.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">LeetCode Profile URL</label>
          <input
            type="url"
            name="leetcodeProfile"
            value={formData.leetcodeProfile}
            onChange={handleChange}
            placeholder="https://leetcode.com/u/..."
            className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">GitHub Profile URL</label>
          <input
            type="url"
            name="githubProfile"
            value={formData.githubProfile}
            onChange={handleChange}
            placeholder="https://github.com/..."
            className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-brand"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium">Bio</label>
          <textarea
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-brand"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
