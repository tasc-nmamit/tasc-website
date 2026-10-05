import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CareerIntent } from "@prisma";

import { extractHackerRankUsername, normalizeLeetCode, normalizeGitHub } from "@/lib/profile-utils";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    let { 
      name, 
      phone, 
      bio, 
      hackerrankUsername, 
      leetcodeProfile, 
      githubProfile, 
      skills,
      languages,
      careerIntent 
    } = data;

    const cleanName = typeof name === "string" ? name.trim() : undefined;
    const cleanPhone = typeof phone === "string" ? phone.trim() : undefined;
    const cleanBio = typeof bio === "string" ? bio.trim() : undefined;
    const cleanHackerRank = typeof hackerrankUsername === "string" ? extractHackerRankUsername(hackerrankUsername) : undefined;
    const cleanLeetCode = typeof leetcodeProfile === "string" ? normalizeLeetCode(leetcodeProfile) : undefined;
    const cleanGitHub = typeof githubProfile === "string" ? normalizeGitHub(githubProfile) : undefined;

    // Validation: make sure required fields are not blank
    if (cleanName !== undefined && !cleanName) {
      return NextResponse.json({ error: "Full Name cannot be left blank." }, { status: 400 });
    }
    if (cleanPhone !== undefined && (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 10)) {
      return NextResponse.json({ error: "Valid 10-digit Phone Number is mandatory." }, { status: 400 });
    }

    const isAiml = !!session.user.isAiml;
    if (isAiml) {
      if (cleanHackerRank !== undefined && !cleanHackerRank) {
        return NextResponse.json({ error: "HackerRank Username cannot be left blank." }, { status: 400 });
      }
      if (cleanLeetCode !== undefined && !cleanLeetCode) {
        return NextResponse.json({ error: "LeetCode Profile cannot be left blank." }, { status: 400 });
      }
      if (cleanGitHub !== undefined && !cleanGitHub) {
        return NextResponse.json({ error: "GitHub Profile cannot be left blank." }, { status: 400 });
      }
      if (careerIntent !== undefined && !Object.values(CareerIntent).includes(careerIntent as CareerIntent)) {
        return NextResponse.json({ error: "Career Plan cannot be left blank." }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (cleanName !== undefined) updateData.name = cleanName;
    if (cleanPhone !== undefined) updateData.phone = cleanPhone;
    if (cleanBio !== undefined) updateData.bio = cleanBio;
    if (cleanHackerRank !== undefined) updateData.hackerrankUsername = cleanHackerRank || null;
    if (cleanLeetCode !== undefined) updateData.leetcodeProfile = cleanLeetCode || null;
    if (cleanGitHub !== undefined) updateData.githubProfile = cleanGitHub || null;
    if (careerIntent !== undefined && Object.values(CareerIntent).includes(careerIntent as CareerIntent)) {
      updateData.careerIntent = careerIntent as CareerIntent;
    }

    if (skills !== undefined) {
      const skillsArray = Array.isArray(skills)
        ? skills.map((s: any) => String(s).trim()).filter(Boolean)
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      if (isAiml && skillsArray.length === 0) {
        return NextResponse.json({ error: "At least one skill is required." }, { status: 400 });
      }
      updateData.skills = skillsArray;
    }

    if (languages !== undefined) {
      const languagesArray = Array.isArray(languages)
        ? languages.map((l: any) => String(l).trim()).filter(Boolean)
        : typeof languages === "string"
        ? languages.split(",").map((l) => l.trim()).filter(Boolean)
        : [];
      if (isAiml && languagesArray.length === 0) {
        return NextResponse.json({ error: "At least one language is required." }, { status: 400 });
      }
      updateData.languages = languagesArray;
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile: " + error.message }, { status: 500 });
  }
}
