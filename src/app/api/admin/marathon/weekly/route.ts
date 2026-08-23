import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { weekNumber, targetYear, date, deadline, title, description, link } = await request.json();

    if (!weekNumber || !targetYear || !date || !deadline || !title || !link) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const contest = await db.marathonWeeklyContest.create({
      data: {
        weekNumber: Number(weekNumber),
        targetYear: Number(targetYear),
        date: new Date(date),
        deadline: new Date(deadline),
        title,
        description,
        link,
      }
    });

    return NextResponse.json(contest);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A contest for this week and target year already exists." }, { status: 400 });
    }
    console.error("Weekly Contest Creation Error:", error);
    return NextResponse.json({ error: "Failed to create weekly contest" }, { status: 500 });
  }
}
