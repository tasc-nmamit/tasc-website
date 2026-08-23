import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { userId, problemId, scoreIncrement, maintainStreak } = await request.json();

    if (!userId || !problemId || scoreIncrement === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use a transaction to ensure data integrity
    await db.$transaction(async (tx) => {
      // 1. Upsert the score for the specific problem
      await tx.marathonScore.upsert({
        where: {
          userId_problemId: { userId, problemId }
        },
        update: {
          score: { increment: Number(scoreIncrement) },
          completed: true,
        },
        create: {
          userId,
          problemId,
          score: Number(scoreIncrement),
          completed: true,
        }
      });

      // 2. Update the user's total score and streak
      await tx.user.update({
        where: { id: userId },
        data: {
          marathonTotalScore: { increment: Number(scoreIncrement) },
          marathonStreak: maintainStreak ? { increment: 1 } : { set: 0 },
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update score:", error);
    return NextResponse.json({ error: "Failed to update score: " + error.message }, { status: 500 });
  }
}
