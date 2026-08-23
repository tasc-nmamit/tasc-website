import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { contestId } = await request.json();

    if (!contestId) {
      return NextResponse.json({ error: "Missing contestId" }, { status: 400 });
    }

    const contest = await db.marathonWeeklyContest.findUnique({
      where: { id: contestId },
      include: { scores: true }
    });

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    if (contest.isConfirmed) {
      return NextResponse.json({ error: "This contest has already been confirmed." }, { status: 400 });
    }

    // Must be after deadline
    if (new Date() < new Date(contest.deadline)) {
      return NextResponse.json({ error: "Cannot confirm before the deadline." }, { status: 400 });
    }

    let updatedCount = 0;

    await db.$transaction(async (tx) => {
      for (const score of contest.scores) {
        if (score.score > 0) {
          await tx.user.update({
            where: { id: score.userId },
            data: {
              marathonTotalScore: { increment: score.score },
              marathonStreak: { increment: 1 } // Assume weekly contest also adds to streak
            }
          });
          updatedCount++;
        }
      }

      await tx.marathonWeeklyContest.update({
        where: { id: contestId },
        data: { isConfirmed: true }
      });
    });

    return NextResponse.json({ success: true, updatedCount });
  } catch (error: any) {
    console.error("Weekly Confirm Error:", error);
    return NextResponse.json({ error: error.message || "Failed to confirm scores" }, { status: 500 });
  }
}
