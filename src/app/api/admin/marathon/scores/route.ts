import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { recalculateUserStreak } from "@/lib/marathon-streak";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { userId, contestId, scoreIncrement, maintainStreak } = await request.json();

    if (!userId || !contestId || scoreIncrement === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use a transaction to ensure data integrity
    await db.$transaction(async (tx) => {
      // 1. Upsert the score for the specific contest
      await tx.marathonDailyScore.upsert({
        where: {
          userId_contestId: { userId, contestId }
        },
        update: {
          score: { increment: Number(scoreIncrement) },
          completed: true,
        },
        create: {
          userId,
          contestId,
          score: Number(scoreIncrement),
          completed: true,
        }
      });

      // 2. Update the user's total score
      await tx.user.update({
        where: { id: userId },
        data: {
          marathonTotalScore: { increment: Number(scoreIncrement) },
        }
      });

      // 3. Recalculate or reset streak accurately
      if (maintainStreak === false) {
        await tx.user.update({
          where: { id: userId },
          data: { marathonStreak: 0 }
        });
      } else {
        await recalculateUserStreak(userId, undefined, tx);
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update score:", error);
    return NextResponse.json({ error: "Failed to update score: " + error.message }, { status: 500 });
  }
}
