import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

    // Find users by email who are in the target year and aiml
    const emails = scores.map(s => s.email.toLowerCase().trim());
    
    const users = await db.user.findMany({
      where: {
        email: { in: emails },
        year: contest.targetYear,
        isAiml: true,
        role: "USER"
      },
      select: { id: true, email: true }
    });

    const emailToUserId = new Map(users.map(u => [u.email.toLowerCase(), u.id]));
    const matchedEmails = new Set(users.map(u => u.email.toLowerCase()));
    
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
