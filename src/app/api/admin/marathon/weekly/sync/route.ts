import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchHackerRankLeaderboard } from "@/lib/hackerrank";

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
    
    // Weekly contests are filtered by targetYear AND they must be students (role: USER)
    const users = await db.user.findMany({
      where: {
        hackerrankUsername: { in: hrUsernames },
        year: contest.targetYear,
        isAiml: true,
        role: "USER"
      },
      select: { id: true, hackerrankUsername: true }
    });

    const hrToUserId = new Map(users.map(u => [u.hackerrankUsername, u.id]));
    const matchedUsernames = new Set(users.map(u => u.hackerrankUsername));
    
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

        await tx.marathonWeeklyScore.upsert({
          where: {
            userId_contestId: { userId, contestId }
          },
          create: {
            userId,
            contestId,
            score: hrUser.score,
            completed: hrUser.score > 0
          },
          update: {
            score: hrUser.score,
            completed: hrUser.score > 0
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
