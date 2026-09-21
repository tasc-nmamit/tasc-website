import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recalculateYearStreaks, recalculateTotalScores } from "@/lib/marathon-streak";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const targetYear = body.targetYear ? Number(body.targetYear) : undefined;

    const [streakResult, scoreResult] = await Promise.all([
      recalculateYearStreaks(targetYear),
      recalculateTotalScores(targetYear),
    ]);

    return NextResponse.json({
      success: true,
      streaksEvaluated: streakResult.totalEvaluated,
      streaksUpdated: streakResult.streaksUpdated,
      scoresUpdated: scoreResult.totalUpdated,
    });
  } catch (error: any) {
    console.error("Recalculate Marathon Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to recalculate marathon metrics" },
      { status: 500 }
    );
  }
}
