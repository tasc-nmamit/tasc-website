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

    if (!dayNumber || !targetYear || !date || !title || !link) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const contest = await db.marathonDailyContest.create({
      data: {
        dayNumber: Number(dayNumber),
        targetYear: Number(targetYear),
        date: new Date(date),
        title,
        description,
        link,
      }
    });

    return NextResponse.json(contest);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A contest for this day and target year already exists." }, { status: 400 });
    }
    console.error("Daily Contest Creation Error:", error);
    return NextResponse.json({ error: "Failed to create daily contest" }, { status: 500 });
  }
}
