import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role, CareerIntent } from "@prisma";
import { extractHackerRankUsername, normalizeLeetCode, normalizeGitHub } from "@/lib/profile-utils";

export async function PATCH(request: Request) {
  const session = await auth();

  // Both ADMIN and OWNER can update user attributes
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      userId,
      name,
      displayName,
      usn,
      phone,
      year,
      branch,
      isAiml,
      isLateral,
      hackerrankUsername,
      leetcodeProfile,
      githubProfile,
      careerIntent,
      skills,
      languages,
      bio,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Admins cannot edit Owners unless the admin is an Owner
    if (targetUser.role === Role.OWNER && session.user.role !== Role.OWNER) {
      return NextResponse.json({ error: "Only Owners can modify Owner accounts" }, { status: 403 });
    }

    const data: any = {};

    if (name !== undefined) data.name = typeof name === "string" ? name.trim() || null : null;
    if (displayName !== undefined) data.displayName = typeof displayName === "string" ? displayName.trim() || null : null;
    if (usn !== undefined) data.usn = typeof usn === "string" ? usn.trim().toUpperCase() || null : null;
    if (phone !== undefined) data.phone = typeof phone === "string" ? phone.trim() || null : null;
    if (year !== undefined) {
      const parsedYear = typeof year === "number" ? year : parseInt(year, 10);
      data.year = !isNaN(parsedYear) && parsedYear >= 1 && parsedYear <= 5 ? parsedYear : null;
    }
    if (branch !== undefined) data.branch = typeof branch === "string" ? branch.trim() || null : null;
    if (typeof isAiml === "boolean") data.isAiml = isAiml;
    if (typeof isLateral === "boolean") data.isLateral = isLateral;

    if (hackerrankUsername !== undefined) {
      const cleanHackerRank = typeof hackerrankUsername === "string" ? extractHackerRankUsername(hackerrankUsername) : null;
      data.hackerrankUsername = cleanHackerRank || null;
    }
    if (leetcodeProfile !== undefined) {
      const cleanLeetCode = typeof leetcodeProfile === "string" ? normalizeLeetCode(leetcodeProfile) : null;
      data.leetcodeProfile = cleanLeetCode || null;
    }
    if (githubProfile !== undefined) {
      const cleanGitHub = typeof githubProfile === "string" ? normalizeGitHub(githubProfile) : null;
      data.githubProfile = cleanGitHub || null;
    }
    if (careerIntent !== undefined) {
      data.careerIntent = Object.values(CareerIntent).includes(careerIntent) ? careerIntent : null;
    }
    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        data.skills = skills.map((s: any) => String(s).trim()).filter(Boolean);
      } else if (typeof skills === "string") {
        data.skills = skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    if (languages !== undefined) {
      if (Array.isArray(languages)) {
        data.languages = languages.map((l: any) => String(l).trim()).filter(Boolean);
      } else if (typeof languages === "string") {
        data.languages = languages.split(",").map((l) => l.trim()).filter(Boolean);
      }
    }
    if (bio !== undefined) data.bio = typeof bio === "string" ? bio.trim() || null : null;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        displayName: true,
        email: true,
        image: true,
        role: true,
        isAiml: true,
        isLateral: true,
        year: true,
        branch: true,
        onboardingComplete: true,
        createdAt: true,
        hackerrankUsername: true,
        leetcodeProfile: true,
        githubProfile: true,
        careerIntent: true,
        phone: true,
        usn: true,
        skills: true,
        languages: true,
        bio: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  // Only OWNER can delete users
  if (!session?.user?.id || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Cannot delete yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Prevent deleting another OWNER
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role === Role.OWNER) {
      return NextResponse.json(
        { error: "Cannot delete an OWNER account" },
        { status: 403 }
      );
    }

    // Delete the user
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
