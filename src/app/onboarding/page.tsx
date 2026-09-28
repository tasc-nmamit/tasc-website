"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface OnboardingData {
  name: string;
  usn: string;
  phone: string;
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
    phone: "",
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
        name: session.user.name || prev.name,
        usn: session.user.usn || prev.usn,
        year: session.user.year?.toString() || prev.year,
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

  const isAiml = session?.user?.isAiml;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const nameTrimmed = data.name.trim();
    const usnTrimmed = data.usn.trim().toUpperCase();
    const phoneTrimmed = data.phone.trim();
    const hrTrimmed = data.hackerrankUsername.trim();
    const lcTrimmed = data.leetcodeProfile.trim();
    const ghTrimmed = data.githubProfile.trim();
    const skillsList = data.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const languagesList = data.languages
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);

    // Basic validation for all users
    if (!nameTrimmed || !usnTrimmed || !phoneTrimmed || !data.year) {
      setError("Name, USN, Phone, and Year are mandatory.");
      return;
    }

    // Strict validation for AIML users
    if (isAiml) {
      if (
        !hrTrimmed ||
        !lcTrimmed ||
        !ghTrimmed ||
        skillsList.length === 0 ||
        languagesList.length === 0 ||
        !data.careerIntent
      ) {
        setError("All fields are mandatory. Please make sure not to leave any field blank.");
        return;
      }
    }

    if (phoneTrimmed.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameTrimmed,
          usn: usnTrimmed,
          phone: phoneTrimmed,
          year: parseInt(data.year),
          hackerrankUsername: isAiml ? hrTrimmed : "",
          leetcodeProfile: isAiml ? lcTrimmed : "",
          githubProfile: isAiml ? ghTrimmed : "",
          skills: isAiml ? skillsList : [],
          languages: isAiml ? languagesList : [],
          careerIntent: isAiml ? data.careerIntent : "NO",
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
          <p className="mt-2 text-sm text-muted-foreground">
            {isAiml
              ? "All fields are mandatory. Please provide all details to unlock your Marathon access and student tools."
              : "Please provide your basic information to complete registration."}
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
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30 uppercase"
                placeholder="e.g. NNM24AM045"
              />
            </div>
          </div>

          {/* Phone & Year of Study */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
                placeholder="e.g. 9876543210"
              />
            </div>
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
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          {isAiml && (
            <>
              {/* Coding Profiles */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Coding Profiles <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    All handles and profile links are mandatory for performance verification and Marathon leaderboard syncing.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="hackerrank" className="mb-1.5 block text-sm font-medium text-foreground">
                      HackerRank Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="hackerrank"
                      type="text"
                      required
                      value={data.hackerrankUsername}
                      onChange={(e) => setData({ ...data, hackerrankUsername: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
                      placeholder="e.g. johndoe123"
                    />
                    <p className="mt-1 text-[11px] text-brand">Required for automated Marathon score syncing</p>
                  </div>

                  <div>
                    <label htmlFor="leetcode" className="mb-1.5 block text-sm font-medium text-foreground">
                      LeetCode Profile Link / Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="leetcode"
                      type="text"
                      required
                      value={data.leetcodeProfile}
                      onChange={(e) => setData({ ...data, leetcodeProfile: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
                      placeholder="https://leetcode.com/u/username or username"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="github" className="mb-1.5 block text-sm font-medium text-foreground">
                    GitHub Profile Link / Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="github"
                    type="text"
                    required
                    value={data.githubProfile}
                    onChange={(e) => setData({ ...data, githubProfile: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
                    placeholder="https://github.com/username or username"
                  />
                </div>
              </div>

              {/* Skills & Languages */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Skills & Languages <span className="text-red-500">*</span>
                </h3>
                <div>
                  <label htmlFor="skills" className="mb-1.5 block text-sm font-medium text-foreground">
                    Skills <span className="text-red-500">*</span> <span className="text-xs text-muted-foreground">(comma-separated)</span>
                  </label>
                  <input
                    id="skills"
                    type="text"
                    required
                    value={data.skills}
                    onChange={(e) => setData({ ...data, skills: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
                    placeholder="e.g. Machine Learning, Python, Web Development, Data Structures"
                  />
                </div>
                <div>
                  <label htmlFor="languages" className="mb-1.5 block text-sm font-medium text-foreground">
                    Languages Known <span className="text-red-500">*</span> <span className="text-xs text-muted-foreground">(comma-separated)</span>
                  </label>
                  <input
                    id="languages"
                    type="text"
                    required
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
            </>
          )}

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
                Saving Profile...
              </span>
            ) : (
              "Complete Profile & Register"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
