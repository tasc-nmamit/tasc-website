import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchHackerRankLeaderboard } from "@/lib/hackerrank";
import { getBatchForUser } from "@/lib/marathon-batches";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { contestId, contestSlug, cookieString } = await request.json();

    if (!contestId || !contestSlug || !cookieString) {
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

    // Fetch leaderboard
    const hrLeaderboard = await fetchHackerRankLeaderboard(contestSlug, cookieString);
    const hrUsernames = hrLeaderboard.map(hr => hr.hacker);
    
    // Weekly contests are filtered by year, allowing 2nd years (2A & 2B) to attempt each other's batch
    const users = await db.user.findMany({
      where: {
        hackerrankUsername: { in: hrUsernames },
        isAiml: true,
        role: "USER"
      },
      select: { id: true, hackerrankUsername: true, email: true, usn: true, year: true }
    });

    const eligibleUsers = users.filter((u) => {
      const batch = getBatchForUser(u);
      const is2ndYear = batch === "2A" || batch === "2B" || u.year === 2;
      const is3rdYear = batch === "3A1" || batch === "3A2" || u.year === 3;
      if (contest.targetYear === 2) return is2ndYear;
      if (contest.targetYear === 3) return is3rdYear;
      return u.year === contest.targetYear;
    });

    const hrToUserId = new Map(eligibleUsers.map(u => [u.hackerrankUsername, u.id]));
    const matchedUsernames = new Set(eligibleUsers.map(u => u.hackerrankUsername));
    
    // Unmatched are those in HR leaderboard but not found in our users list
    const unmatchedUsernames = hrUsernames.filter(username => !matchedUsernames.has(username));
    
    // Prepare leaderboard for preview
    const leaderboard = hrLeaderboard.map(hr => ({
      hacker: hr.hacker,
      score: hr.score,
      matched: matchedUsernames.has(hr.hacker)
    }));
    let updatedCount = 0;

    await db.$transaction(async (tx) => {
      for (const hrUser of hrLeaderboard) {
        const userId = hrToUserId.get(hrUser.hacker);
        if (!userId) continue; 

        const existing = await tx.marathonWeeklyScore.findUnique({
          where: { userId_contestId: { userId, contestId } }
        });

        const currentQuizScore = existing?.quizScore || 0;
        const totalScore = currentQuizScore + hrUser.score;

        await tx.marathonWeeklyScore.upsert({
          where: {
            userId_contestId: { userId, contestId }
          },
          create: {
            userId,
            contestId,
            quizScore: 0,
            contestScore: hrUser.score,
            score: totalScore,
            completed: totalScore > 0
          },
          update: {
            contestScore: hrUser.score,
            score: totalScore,
            completed: totalScore > 0
          }
        });
        updatedCount++;
      }
    });

    return NextResponse.json({ 
      success: true, 
      fetchedCount: hrLeaderboard.length,
      matchedCount: matchedUsernames.size,
      leaderboard,
      unmatchedUsernames
    });
  } catch (error: any) {
    console.error("Weekly Sync Error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync leaderboard" }, { status: 500 });
  }
}
