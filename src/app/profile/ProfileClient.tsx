"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";

export default function ProfileClient({ user }: { user: any }) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    bio: user.bio || "",
    hackerrankUsername: user.hackerrankUsername || "",
    leetcodeProfile: user.leetcodeProfile || "",
    githubProfile: user.githubProfile || "",
    skills: (user.skills || []).join(", "),
    languages: (user.languages || []).join(", "),
    careerIntent: user.careerIntent || "PLACEMENT",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        hackerrankUsername: user.hackerrankUsername || "",
        leetcodeProfile: user.leetcodeProfile || "",
        githubProfile: user.githubProfile || "",
        skills: (user.skills || []).join(", "),
        languages: (user.languages || []).join(", "),
        careerIntent: user.careerIntent || "PLACEMENT",
      });
    }
  }, [user]);

  const isFaculty = user.email?.endsWith("@nitte.edu.in") && !user.usn;
  const isAiml = !!user.isAiml;
  const showStudentFields = !isFaculty;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameTrimmed = formData.name.trim();
    const phoneTrimmed = formData.phone.trim();
    const hrTrimmed = formData.hackerrankUsername.trim();
    const lcTrimmed = formData.leetcodeProfile.trim();
    const ghTrimmed = formData.githubProfile.trim();
    const skillsList = formData.skills
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    const languagesList = formData.languages
      .split(",")
      .map((l: string) => l.trim())
      .filter(Boolean);

    if (!nameTrimmed) {
      alert("Name is mandatory.");
      return;
    }

    if (showStudentFields) {
      if (!phoneTrimmed) {
        alert("Phone number is mandatory.");
        return;
      }
      if (phoneTrimmed.replace(/\D/g, "").length < 10) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
      }
    }

    if (isAiml) {
      if (
        !hrTrimmed ||
        !lcTrimmed ||
        !ghTrimmed ||
        skillsList.length === 0 ||
        languagesList.length === 0 ||
        !formData.careerIntent
      ) {
        alert("All AIML fields are mandatory. Please make sure not to leave any field blank.");
        return;
      }
    }

    setLoading(true);

    try {
      const payload: any = {
        name: nameTrimmed,
        bio: formData.bio.trim(),
      };

      if (showStudentFields) {
        payload.phone = phoneTrimmed;
        payload.hackerrankUsername = hrTrimmed;
        payload.leetcodeProfile = lcTrimmed;
        payload.githubProfile = ghTrimmed;
        payload.skills = skillsList;
        payload.languages = languagesList;
        if (isAiml) {
          payload.careerIntent = formData.careerIntent;
        }
      }

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to update profile");
      }

      if (resData.user) {
        setFormData({
          name: resData.user.name || "",
          phone: resData.user.phone || "",
          bio: resData.user.bio || "",
          hackerrankUsername: resData.user.hackerrankUsername || "",
          leetcodeProfile: resData.user.leetcodeProfile || "",
          githubProfile: resData.user.githubProfile || "",
          skills: (resData.user.skills || []).join(", "),
          languages: (resData.user.languages || []).join(", "),
          careerIntent: resData.user.careerIntent || "PLACEMENT",
        });
      }

      if (updateSession) {
        await updateSession();
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

      {/* Read-only Academic Badges / Info */}
      <div className="relative z-10 grid gap-3 sm:grid-cols-2 p-3.5 rounded-lg border border-brand/20 bg-background/60 font-mono-tech text-xs">
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase">Registered Email</span>
          <span className="font-semibold text-foreground truncate block">{user.email}</span>
        </div>
        {user.usn && (
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase">USN</span>
            <span className="font-semibold text-gold">{user.usn}</span>
          </div>
        )}
        {user.branch && (
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase">Branch / Dept</span>
            <span className="font-semibold text-foreground">{user.branch}</span>
          </div>
        )}
        {user.year && (
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase">Year of Study</span>
            <span className="font-semibold text-brand-accent">{user.year}th Year</span>
          </div>
        )}
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase">Department Status</span>
          <span className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold uppercase ${isAiml ? "bg-brand/20 text-brand-accent border border-brand/30" : "bg-muted text-muted-foreground"}`}>
            {isAiml ? "AIML Member" : "Non-AIML"}
          </span>
        </div>
      </div>

      <div className="relative z-10 grid gap-6 sm:grid-cols-2 font-space-grotesk">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-space-grotesk text-foreground"
          />
        </div>

        {showStudentFields && (
          <div>
            <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-mono-tech text-foreground"
              placeholder="10-digit mobile number"
            />
          </div>
        )}

        {isAiml && (
          <div>
            <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">
              Career Intent (AIML) <span className="text-red-500">*</span>
            </label>
            <select
              name="careerIntent"
              required
              value={formData.careerIntent}
              onChange={handleChange}
              className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-space-grotesk text-foreground"
            >
              <option value="PLACEMENT">Will sit for placements</option>
              <option value="NO">Will not sit for placements</option>
              <option value="HIGHER_STUDIES">Will take higher studies</option>
            </select>
          </div>
        )}

        {showStudentFields && (
          <>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">
                HackerRank Username {isAiml && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="hackerrankUsername"
                required={isAiml}
                value={formData.hackerrankUsername}
                onChange={handleChange}
                placeholder="e.g. johndoe123 or profile URL"
                className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-mono-tech text-foreground"
              />
              <p className="mt-1 text-[11px] font-mono-tech text-gold">Required for Marathon score syncing</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">
                LeetCode Profile URL / Username {isAiml && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="leetcodeProfile"
                required={isAiml}
                value={formData.leetcodeProfile}
                onChange={handleChange}
                placeholder="https://leetcode.com/u/... or username"
                className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-mono-tech text-foreground"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">
                GitHub Profile URL / Username {isAiml && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="githubProfile"
                required={isAiml}
                value={formData.githubProfile}
                onChange={handleChange}
                placeholder="https://github.com/... or username"
                className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-mono-tech text-foreground"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">
                Skills {isAiml && <span className="text-red-500">*</span>} <span className="text-[11px] text-muted-foreground lowercase">(comma-separated)</span>
              </label>
              <input
                type="text"
                name="skills"
                required={isAiml}
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. Machine Learning, Python, Next.js, PyTorch"
                className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-space-grotesk text-foreground"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-mono-tech text-muted-foreground uppercase">
                Languages Known {isAiml && <span className="text-red-500">*</span>} <span className="text-[11px] text-muted-foreground lowercase">(comma-separated)</span>
              </label>
              <input
                type="text"
                name="languages"
                required={isAiml}
                value={formData.languages}
                onChange={handleChange}
                placeholder="e.g. Python, Java, C++, JavaScript"
                className="w-full rounded-lg border border-brand/30 bg-background px-4 py-2.5 outline-none focus:border-brand-accent text-sm font-space-grotesk text-foreground"
              />
            </div>
          </>
        )}

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
