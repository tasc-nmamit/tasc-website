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

    const contest = await db.marathonDailyContest.findUnique({
      where: { id: contestId },
      include: { scores: true }
    });

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    if (contest.isConfirmed) {
      return NextResponse.json({ error: "This contest has already been confirmed." }, { status: 400 });
    }

    const nextDay = new Date(contest.date);
    nextDay.setDate(nextDay.getDate() + 1);

    if (new Date() < nextDay) {
      return NextResponse.json({ error: "Cannot confirm before the next day (5:30 AM IST)." }, { status: 400 });
    }

    let updatedCount = 0;

    await db.$transaction(async (tx) => {
      for (const score of contest.scores) {
        if (score.score > 0) {
          await tx.user.update({
            where: { id: score.userId },
            data: {
              marathonTotalScore: { increment: score.score },
              marathonStreak: { increment: 1 }
            }
          });
        } else {
          // Reset streak if score is 0
          await tx.user.update({
            where: { id: score.userId },
            data: {
              marathonStreak: 0
            }
          });
        }
        updatedCount++;
      }

      await tx.marathonDailyContest.update({
        where: { id: contestId },
        data: { isConfirmed: true }
      });
    });

    return NextResponse.json({ success: true, updatedCount });
  } catch (error: any) {
    console.error("Confirm Scores Error:", error);
    return NextResponse.json({ error: error.message || "Failed to confirm scores" }, { status: 500 });
  }
}
