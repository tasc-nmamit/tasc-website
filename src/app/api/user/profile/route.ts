import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CareerIntent } from "@prisma";

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

    // Helper to extract username from common URLs
    const extractUsername = (val: string | undefined | null) => {
      if (!val) return "";
      try {
        const url = new URL(val.startsWith("http") ? val : `https://${val}`);
        const parts = url.pathname.split("/").filter(Boolean);
        return parts[parts.length - 1];
      } catch {
        return val.trim();
      }
    };

    const cleanName = typeof name === "string" ? name.trim() : undefined;
    const cleanPhone = typeof phone === "string" ? phone.trim() : undefined;
    const cleanBio = typeof bio === "string" ? bio.trim() : undefined;
    const cleanHackerRank = typeof hackerrankUsername === "string" ? extractUsername(hackerrankUsername) : undefined;
    
    let cleanLeetCode = typeof leetcodeProfile === "string" ? leetcodeProfile.trim() : undefined;
    if (cleanLeetCode) {
      if (!cleanLeetCode.startsWith("http://") && !cleanLeetCode.startsWith("https://")) {
        cleanLeetCode = `https://leetcode.com/u/${cleanLeetCode.replace(/^\/+/, "")}`;
      }
    }

    let cleanGitHub = typeof githubProfile === "string" ? githubProfile.trim() : undefined;
    if (cleanGitHub) {
      if (!cleanGitHub.startsWith("http://") && !cleanGitHub.startsWith("https://")) {
        cleanGitHub = `https://github.com/${cleanGitHub.replace(/^\/+/, "")}`;
      }
    }

    // Validation: make sure required fields are not blank
    if (cleanName !== undefined && !cleanName) {
      return NextResponse.json({ error: "Full Name cannot be left blank." }, { status: 400 });
    }
    if (cleanPhone !== undefined && (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 10)) {
      return NextResponse.json({ error: "Valid 10-digit Phone Number is mandatory." }, { status: 400 });
    }
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

    const updateData: any = {};
    if (cleanName !== undefined) updateData.name = cleanName;
    if (cleanPhone !== undefined) updateData.phone = cleanPhone;
    if (cleanBio !== undefined) updateData.bio = cleanBio;
    if (cleanHackerRank !== undefined) updateData.hackerrankUsername = cleanHackerRank;
    if (cleanLeetCode !== undefined) updateData.leetcodeProfile = cleanLeetCode;
    if (cleanGitHub !== undefined) updateData.githubProfile = cleanGitHub;
    if (careerIntent !== undefined) updateData.careerIntent = careerIntent as CareerIntent;

    if (skills !== undefined) {
      const skillsArray = Array.isArray(skills)
        ? skills.map((s: any) => String(s).trim()).filter(Boolean)
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      if (skillsArray.length === 0) {
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
      if (languagesArray.length === 0) {
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
