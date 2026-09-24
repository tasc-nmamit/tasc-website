import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.isAiml) {
    return NextResponse.json({ error: "Only AIML students can edit profile" }, { status: 403 });
  }

  try {
    const data = await request.json();

    // Extract only allowed fields
    let { 
      name, 
      phone, 
      bio, 
      hackerrankUsername, 
      leetcodeProfile, 
      githubProfile, 
      careerIntent 
    } = data;

    // Helper to extract username from common URLs
    const extractUsername = (val: string | undefined | null) => {
      if (!val) return "";
      try {
        const url = new URL(val);
        // For leetcode.com/u/username or github.com/username or hackerrank.com/profile/username
        const parts = url.pathname.split('/').filter(Boolean);
        return parts[parts.length - 1]; // usually the last part is the username
      } catch {
        return val.trim(); // If not a valid URL, assume it's just the username
      }
    };

    hackerrankUsername = extractUsername(hackerrankUsername);
    leetcodeProfile = extractUsername(leetcodeProfile);
    githubProfile = extractUsername(githubProfile);

    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        bio,
        hackerrankUsername,
        leetcodeProfile,
        githubProfile,
        careerIntent
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
