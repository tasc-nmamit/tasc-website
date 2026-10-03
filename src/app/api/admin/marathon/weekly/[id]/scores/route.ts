import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const params = await context.params;
    const scores = await db.marathonWeeklyScore.findMany({
      where: { contestId: params.id },
      include: {
        user: {
          select: { name: true, email: true, usn: true, hackerrankUsername: true, year: true }
        }
      },
      orderBy: { score: 'desc' }
    });

    return NextResponse.json({ scores });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const params = await context.params;
    const { scoreId, quizScore, contestScore } = await request.json();

    if (!scoreId || typeof quizScore !== 'number' || typeof contestScore !== 'number') {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    
    const existing = await db.marathonWeeklyScore.findUnique({
      where: { id: scoreId, contestId: params.id }
    });

    if (!existing) {
      return NextResponse.json({ error: "Score not found" }, { status: 404 });
    }

    const totalScore = quizScore + contestScore;

    const contest = await db.marathonWeeklyContest.findUnique({
      where: { id: params.id }
    });
    
    let updated;

    await db.$transaction(async (tx) => {
      updated = await tx.marathonWeeklyScore.update({
        where: { id: scoreId },
        data: {
          quizScore,
          contestScore,
          score: totalScore,
          completed: totalScore > 0
        }
      });

      if (contest?.isConfirmed) {
        const diff = totalScore - existing.score;
        if (diff !== 0) {
          await tx.user.update({
            where: { id: existing.userId },
            data: {
              marathonTotalScore: { increment: diff }
            }
          });
        }
      }
    });

    return NextResponse.json({ success: true, score: updated });
  } catch (error: any) {
    console.error("Failed to update score", error);
    return NextResponse.json({ error: "Failed to update score" }, { status: 500 });
  }
}
