import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CareerIntent } from "@prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, usn, year, hackerrankUsername, leetcodeProfile, githubProfile, skills, languages, careerIntent } = body;

    // Validate required fields
    if (!name || !usn || !year || !careerIntent) {
      return NextResponse.json(
        { error: "Name, USN, Year, and Career Intent are required" },
        { status: 400 }
      );
    }

    // Validate year
    const yearNum = parseInt(year);
    if (![2, 3, 4].includes(yearNum)) {
      return NextResponse.json(
        { error: "Year must be 2, 3, or 4" },
        { status: 400 }
      );
    }

    // Validate careerIntent enum
    if (!Object.values(CareerIntent).includes(careerIntent as CareerIntent)) {
      return NextResponse.json(
        { error: "Invalid career intent value" },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        usn,
        year: yearNum,
        hackerrankUsername: hackerrankUsername || null,
        leetcodeProfile: leetcodeProfile || null,
        githubProfile: githubProfile || null,
        skills: Array.isArray(skills) ? skills : [],
        languages: Array.isArray(languages) ? languages : [],
        careerIntent: careerIntent as CareerIntent,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
