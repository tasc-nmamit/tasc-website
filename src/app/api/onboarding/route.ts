import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CareerIntent } from "@prisma";

// Helper to extract clean username from URL or return trimmed username
function extractUsername(val: string): string {
  if (!val) return "";
  const trimmed = val.trim();
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || trimmed;
  } catch {
    return trimmed;
  }
}

// Helper to normalize LeetCode URL
function normalizeLeetCode(val: string): string {
  const trimmed = val.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://leetcode.com/u/${trimmed.replace(/^\/+/, "")}`;
}

// Helper to normalize GitHub URL
function normalizeGitHub(val: string): string {
  const trimmed = val.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://github.com/${trimmed.replace(/^\/+/, "")}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAiml = session.user.isAiml;

  try {
    const body = await request.json();
    const {
      name,
      usn,
      phone,
      year,
      hackerrankUsername,
      leetcodeProfile,
      githubProfile,
      skills,
      languages,
      careerIntent,
    } = body;

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanUsn = typeof usn === "string" ? usn.trim().toUpperCase() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanYear = parseInt(year);
    const cleanHackerRank = typeof hackerrankUsername === "string" ? extractUsername(hackerrankUsername) : "";
    const cleanLeetCode = typeof leetcodeProfile === "string" ? normalizeLeetCode(leetcodeProfile) : "";
    const cleanGitHub = typeof githubProfile === "string" ? normalizeGitHub(githubProfile) : "";

    const cleanSkills = Array.isArray(skills)
      ? skills.map((s: any) => String(s).trim()).filter(Boolean)
      : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const cleanLanguages = Array.isArray(languages)
      ? languages.map((l: any) => String(l).trim()).filter(Boolean)
      : typeof languages === "string"
      ? languages.split(",").map((l) => l.trim()).filter(Boolean)
      : [];

    // Basic validation for everyone
    if (!cleanName) {
      return NextResponse.json({ error: "Full Name is mandatory and cannot be left blank." }, { status: 400 });
    }
    if (!cleanUsn) {
      return NextResponse.json({ error: "USN is mandatory and cannot be left blank." }, { status: 400 });
    }
    if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Valid 10-digit Phone Number is mandatory." }, { status: 400 });
    }
    if (![1, 2, 3, 4].includes(cleanYear)) {
      return NextResponse.json({ error: "Year of study is mandatory (must be 1st, 2nd, 3rd, or 4th Year)." }, { status: 400 });
    }

    // Strict validation for AIML
    if (isAiml) {
      if (!cleanHackerRank) {
        return NextResponse.json({ error: "HackerRank Username is mandatory for AIML marathon score syncing." }, { status: 400 });
      }
      if (!cleanLeetCode) {
        return NextResponse.json({ error: "LeetCode Profile Link is mandatory and cannot be left blank." }, { status: 400 });
      }
      if (!cleanGitHub) {
        return NextResponse.json({ error: "GitHub Profile Link is mandatory and cannot be left blank." }, { status: 400 });
      }
      if (cleanSkills.length === 0) {
        return NextResponse.json({ error: "Skills field is mandatory. Please provide at least one skill." }, { status: 400 });
      }
      if (cleanLanguages.length === 0) {
        return NextResponse.json({ error: "Languages Known field is mandatory. Please provide at least one language." }, { status: 400 });
      }
      if (!careerIntent || !Object.values(CareerIntent).includes(careerIntent as CareerIntent)) {
        return NextResponse.json({ error: "Career Plan is mandatory. Please select your placement intent." }, { status: 400 });
      }
    }

    const updateData: any = {
      name: cleanName,
      usn: cleanUsn,
      phone: cleanPhone,
      year: cleanYear,
      onboardingComplete: true,
    };

    if (isAiml) {
      updateData.hackerrankUsername = cleanHackerRank;
      updateData.leetcodeProfile = cleanLeetCode;
      updateData.githubProfile = cleanGitHub;
      updateData.skills = cleanSkills;
      updateData.languages = cleanLanguages;
      updateData.careerIntent = careerIntent as CareerIntent;
    }

    await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to save profile. Please check all fields and try again." },
      { status: 500 }
    );
  }
}
