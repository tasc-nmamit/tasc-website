import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { dayNumber, targetYear, date, title, description, link } = await request.json();

    if (!dayNumber || !date || !title || !link) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const problem = await db.marathonDailyContest.create({
      data: {
        dayNumber: Number(dayNumber),
        targetYear: Number(targetYear || 2),
        date: new Date(date),
        title,
        description,
        link,
      },
    });

    return NextResponse.json(problem);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "A problem for this Day Number already exists." }, { status: 400 });
    }
    console.error("Failed to add problem:", error);
    return NextResponse.json({ error: "Failed to add problem: " + error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const problems = await db.marathonDailyContest.findMany({
      orderBy: { dayNumber: "desc" },
    });
    return NextResponse.json(problems);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}
