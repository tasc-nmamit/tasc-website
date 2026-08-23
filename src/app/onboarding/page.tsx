"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface OnboardingData {
  name: string;
  usn: string;
  year: string;
  hackerrankUsername: string;
  leetcodeProfile: string;
  githubProfile: string;
  skills: string;
  languages: string;
  careerIntent: string;
}

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<OnboardingData>({
    name: "",
    usn: "",
    year: "",
    hackerrankUsername: "",
    leetcodeProfile: "",
    githubProfile: "",
    skills: "",
    languages: "",
    careerIntent: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
    if (session?.user) {
      setData((prev) => ({
        ...prev,
        name: session.user.name || "",
        year: session.user.year?.toString() || "",
      }));
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <main className="flex min-h-dvh items-center justify-center pt-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </main>
    );
  }

  if (!session?.user?.isAiml) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center pt-24 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Not Applicable</h1>
          <p className="mt-2 text-muted-foreground">
            Onboarding is only required for AIML department students.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand/90"
          >
            Go Home
          </button>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          year: parseInt(data.year),
          skills: data.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          languages: data.languages
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to save profile");
      }

      // Refresh session to get updated onboardingComplete
      await update();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 pt-28 pb-16">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-purple-600 shadow-lg shadow-brand/25">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Fill in your details to access all AIML features
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-border/50 bg-background/80 p-6 shadow-xl backdrop-blur-xl sm:p-8"
        >
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Name & USN */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="usn" className="mb-1.5 block text-sm font-medium text-foreground">
                USN <span className="text-red-500">*</span>
              </label>
              <input
                id="usn"
                type="text"
                required
                value={data.usn}
                onChange={(e) => setData({ ...data, usn: e.target.value.toUpperCase() })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
                placeholder="e.g. NNM24AM045"
              />
            </div>
          </div>

          {/* Year */}
          <div>
            <label htmlFor="year" className="mb-1.5 block text-sm font-medium text-foreground">
              Year of Study <span className="text-red-500">*</span>
            </label>
            <select
              id="year"
              required
              value={data.year}
              onChange={(e) => setData({ ...data, year: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
            >
              <option value="">Select year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          {/* Coding Profiles */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Coding Profiles
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="hackerrank" className="mb-1.5 block text-sm font-medium text-foreground">
                  HackerRank Username
                </label>
                <input
                  id="hackerrank"
                  type="text"
                  value={data.hackerrankUsername}
                  onChange={(e) => setData({ ...data, hackerrankUsername: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
                  placeholder="your_username"
                />
              </div>
              <div>
                <label htmlFor="github" className="mb-1.5 block text-sm font-medium text-foreground">
                  GitHub Profile Link
                </label>
                <input
                  id="github"
                  type="url"
                  value={data.githubProfile}
                  onChange={(e) => setData({ ...data, githubProfile: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
            <div>
              <label htmlFor="leetcode" className="mb-1.5 block text-sm font-medium text-foreground">
                LeetCode Profile Link
              </label>
              <input
                id="leetcode"
                type="url"
                value={data.leetcodeProfile}
                onChange={(e) => setData({ ...data, leetcodeProfile: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
                placeholder="https://leetcode.com/username"
              />
            </div>
          </div>

          {/* Skills & Languages */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Skills & Languages
            </h3>
            <div>
              <label htmlFor="skills" className="mb-1.5 block text-sm font-medium text-foreground">
                Skills <span className="text-xs text-muted-foreground">(comma-separated)</span>
              </label>
              <input
                id="skills"
                type="text"
                value={data.skills}
                onChange={(e) => setData({ ...data, skills: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
                placeholder="e.g. Machine Learning, Web Development, Data Analysis"
              />
            </div>
            <div>
              <label htmlFor="languages" className="mb-1.5 block text-sm font-medium text-foreground">
                Languages Known <span className="text-xs text-muted-foreground">(comma-separated)</span>
              </label>
              <input
                id="languages"
                type="text"
                value={data.languages}
                onChange={(e) => setData({ ...data, languages: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
                placeholder="e.g. Python, Java, C++, JavaScript"
              />
            </div>
          </div>

          {/* Career Intent */}
          <div>
            <label className="mb-3 block text-sm font-medium text-foreground">
              Career Plan <span className="text-red-500">*</span>
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: "PLACEMENT", label: "Will sit for placements", icon: "💼" },
                { value: "NO", label: "Will not sit for placements", icon: "🚫" },
                { value: "HIGHER_STUDIES", label: "Will take higher studies", icon: "🎓" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                    data.careerIntent === option.value
                      ? "border-brand bg-brand/5 shadow-md shadow-brand/10"
                      : "border-border/50 hover:border-brand/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="careerIntent"
                    value={option.value}
                    checked={data.careerIntent === option.value}
                    onChange={(e) => setData({ ...data, careerIntent: e.target.value })}
                    className="sr-only"
                    required
                  />
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-brand to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:shadow-brand/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              "Complete Profile"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
