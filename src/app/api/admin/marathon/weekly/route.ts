import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseContestDate } from "@/lib/date-utils";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { weekNumber, targetYear, targetBatch, date, deadline, title, description, link, slug, quizLink } = await request.json();

    if (!weekNumber || !date || !deadline || !title || !link) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine target year from targetBatch or targetYear
    let resolvedTargetYear = Number(targetYear) || 2;
    if (targetBatch === "2A" || targetBatch === "2B" || targetBatch === "2") {
      resolvedTargetYear = 2;
    } else if (targetBatch === "3") {
      resolvedTargetYear = 3;
    }

    const contest = await db.marathonWeeklyContest.create({
      data: {
        weekNumber: Number(weekNumber),
        targetYear: resolvedTargetYear,
        targetBatch: targetBatch || (resolvedTargetYear === 3 ? "3" : "2"),
        date: parseContestDate(date),
        deadline: parseContestDate(deadline),
        title,
        description,
        link,
        slug: slug || null,
        quizLink: quizLink || null,
      }
    });

    return NextResponse.json(contest);
  } catch (error: any) {
    console.error("Weekly Contest Creation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create weekly contest" }, { status: 500 });
  }
}

