import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { recalculateYearStreaks } from "@/lib/marathon-streak";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { contestId, force } = await request.json();

    if (!contestId) {
      return NextResponse.json({ error: "Missing contestId" }, { status: 400 });
    }

    const contest = await db.marathonDailyContest.findUnique({
      where: { id: contestId },
      include: { 
        scores: {
          include: {
            user: { select: { role: true, hackerrankUsername: true } }
          }
        }
      }
    });

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    if (contest.isConfirmed) {
      return NextResponse.json({ error: "This contest has already been confirmed." }, { status: 400 });
    }

    const nextDay = new Date(contest.date);
    nextDay.setDate(nextDay.getDate() + 1);

    if (!force && new Date() < nextDay) {
      return NextResponse.json({ error: "Cannot confirm before the next day (5:30 AM IST)." }, { status: 400 });
    }

    let updatedCount = 0;
    const skippedNonStudents: string[] = [];
    let streakResult = { totalEvaluated: 0, streaksUpdated: 0 };

    await db.$transaction(async (tx) => {
      // 1. Mark contest as confirmed
      await tx.marathonDailyContest.update({
        where: { id: contestId },
        data: { isConfirmed: true }
      });

      // 2. Increment marathonTotalScore for users who scored
      for (const score of contest.scores) {
        if (score.user.role === "ADMIN" || score.user.role === "OWNER") {
          if (score.user.hackerrankUsername) {
            skippedNonStudents.push(score.user.hackerrankUsername);
          }
          continue; // Skip non-students
        }

        if (score.score > 0) {
          await tx.user.update({
            where: { id: score.userId },
            data: {
              marathonTotalScore: { increment: score.score },
            }
          });
          updatedCount++;
        }
      }

      // 3. Recalculate streaks for the entire targetYear
      // This ensures all students who completed continue their streak,
      // and any student who missed this confirmed contest has their streak reset to 0!
      streakResult = await recalculateYearStreaks(contest.targetYear, tx);
    });

    return NextResponse.json({ 
      success: true, 
      updatedCount, 
      skippedNonStudents,
      streaksEvaluated: streakResult.totalEvaluated,
      streaksUpdated: streakResult.streaksUpdated
    });
  } catch (error: any) {
    console.error("Confirm Scores Error:", error);
    return NextResponse.json({ error: error.message || "Failed to confirm scores" }, { status: 500 });
  }
}
