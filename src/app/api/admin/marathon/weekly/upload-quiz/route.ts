import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getBatchForUser } from "@/lib/marathon-batches";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { contestId, scores } = await request.json();

    if (!contestId || !scores || !Array.isArray(scores)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const contest = await db.marathonWeeklyContest.findUnique({
      where: { id: contestId }
    });

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    if (contest.isConfirmed) {
      return NextResponse.json({ error: "Scores for this contest have already been confirmed." }, { status: 400 });
    }
    // Find users by email who are AIML students
    const emails = scores.map(s => s.email.toLowerCase().trim());
    
    const users = await db.user.findMany({
      where: {
        email: { in: emails },
        isAiml: true,
        role: "USER"
      },
      select: { id: true, email: true, usn: true, year: true }
    });

    // 2nd years (2A & 2B) are allowed to attempt each other's batch
    const eligibleUsers = users.filter((u) => {
      const batch = getBatchForUser(u);
      const is2ndYear = batch === "2A" || batch === "2B" || u.year === 2;
      const is3rdYear = batch === "3A1" || batch === "3A2" || u.year === 3;
      if (contest.targetYear === 2) return is2ndYear;
      if (contest.targetYear === 3) return is3rdYear;
      return u.year === contest.targetYear;
    });

    const emailToUserId = new Map(eligibleUsers.map(u => [u.email.toLowerCase(), u.id]));
    const matchedEmails = new Set(eligibleUsers.map(u => u.email.toLowerCase()));
    
    const unmatchedEmails = emails.filter(e => !matchedEmails.has(e));
    let updatedCount = 0;

    await db.$transaction(async (tx) => {
      for (const item of scores) {
        const email = item.email.toLowerCase().trim();
        const userId = emailToUserId.get(email);
        if (!userId) continue; 
        
        const quizScore = Math.round(Number(item.score)) || 0;

        const existing = await tx.marathonWeeklyScore.findUnique({
          where: { userId_contestId: { userId, contestId } }
        });

        const currentContestScore = existing?.contestScore || 0;
        const totalScore = quizScore + currentContestScore;

        await tx.marathonWeeklyScore.upsert({
          where: {
            userId_contestId: { userId, contestId }
          },
          create: {
            userId,
            contestId,
            quizScore,
            contestScore: 0,
            score: quizScore,
            completed: quizScore > 0
          },
          update: {
            quizScore,
            score: totalScore,
            completed: totalScore > 0
          }
        });
        updatedCount++;
      }
    });

    return NextResponse.json({ 
      success: true, 
      receivedCount: scores.length,
      matchedCount: matchedEmails.size,
      unmatchedEmails
    });
  } catch (error: any) {
    console.error("Quiz Upload Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload quiz scores" }, { status: 500 });
  }
}
