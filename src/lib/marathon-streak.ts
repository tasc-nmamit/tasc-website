import { db } from "@/lib/db";

/**
 * Calculates a single user's daily marathon streak based on consecutive
 * confirmed daily contests completed backwards from the latest confirmed contest.
 */
export async function calculateUserStreak(
  userId: string,
  userYear?: number | null,
  client: any = db
): Promise<number> {
  let year = userYear;
  if (!year) {
    const user = await client.user.findUnique({
      where: { id: userId },
      select: { year: true, isAiml: true },
    });
    if (!user || !user.isAiml || !user.year) return 0;
    year = user.year;
  }

  // Fetch all confirmed daily contests for this student's year, ordered from most recent to oldest
  const confirmedContests = await client.marathonDailyContest.findMany({
    where: { targetYear: year, isConfirmed: true },
    orderBy: { date: "desc" },
    include: {
      scores: {
        where: { userId },
      },
    },
  });

  let streak = 0;
  for (const contest of confirmedContests) {
    const score = contest.scores[0];
    if (score && score.completed && score.score > 0) {
      streak++;
    } else {
      // Missing or zero score breaks the active streak
      break;
    }
  }

  return streak;
}

/**
 * Recalculates and updates the streak for a single user in the database.
 */
export async function recalculateUserStreak(
  userId: string,
  userYear?: number | null,
  client: any = db
): Promise<number> {
  const streak = await calculateUserStreak(userId, userYear, client);
  await client.user.update({
    where: { id: userId },
    data: { marathonStreak: streak },
  });
  return streak;
}

/**
 * Recalculates streaks for all students in a given target year (or all years if omitted).
 * Evaluates active streaks against confirmed contests and resets missed streaks to 0.
 */
export async function recalculateYearStreaks(
  targetYear?: number,
  client: any = db
): Promise<{ totalEvaluated: number; streaksUpdated: number }> {
  const years = targetYear ? [targetYear] : [2, 3];
  let totalEvaluated = 0;
  let streaksUpdated = 0;

  for (const year of years) {
    // 1. Fetch all confirmed contests for this year ordered by date desc
    const confirmedContests = await client.marathonDailyContest.findMany({
      where: { targetYear: year, isConfirmed: true },
      orderBy: { date: "desc" },
      select: { id: true },
    });

    // 2. Fetch all AIML students in this year
    const students = await client.user.findMany({
      where: {
        year,
        isAiml: true,
        role: "USER",
      },
      select: { id: true, marathonStreak: true },
    });

    totalEvaluated += students.length;
    if (students.length === 0) continue;

    // 3. If there are no confirmed contests, all streaks are 0
    if (confirmedContests.length === 0) {
      for (const student of students) {
        if (student.marathonStreak !== 0) {
          await client.user.update({
            where: { id: student.id },
            data: { marathonStreak: 0 },
          });
          streaksUpdated++;
        }
      }
      continue;
    }

    // 4. Fetch all completed scores for these confirmed contests
    const scores = await client.marathonDailyScore.findMany({
      where: {
        userId: { in: students.map((s: { id: string }) => s.id) },
        contestId: { in: confirmedContests.map((c: { id: string }) => c.id) },
        completed: true,
        score: { gt: 0 },
      },
      select: { userId: true, contestId: true },
    });

    const completedSet = new Set(scores.map((s: { userId: string; contestId: string }) => `${s.userId}:${s.contestId}`));

    // 5. Compute streak for each student
    for (const student of students) {
      let streak = 0;
      for (const contest of confirmedContests) {
        if (completedSet.has(`${student.id}:${contest.id}`)) {
          streak++;
        } else {
          break; // streak broke
        }
      }

      if (student.marathonStreak !== streak) {
        await client.user.update({
          where: { id: student.id },
          data: { marathonStreak: streak },
        });
        streaksUpdated++;
      }
    }
  }

  return { totalEvaluated, streaksUpdated };
}

/**
 * Recalculates total score for all students based on confirmed daily & weekly contests.
 */
export async function recalculateTotalScores(
  targetYear?: number,
  client: any = db
): Promise<{ totalUpdated: number }> {
  const whereYear = targetYear ? { year: targetYear } : {};
  const students = await client.user.findMany({
    where: {
      ...whereYear,
      isAiml: true,
      role: "USER",
    },
    select: { id: true, marathonTotalScore: true },
  });

  let totalUpdated = 0;

  for (const student of students) {
    const [dailySum, weeklySum] = await Promise.all([
      client.marathonDailyScore.aggregate({
        where: {
          userId: student.id,
          completed: true,
          contest: { isConfirmed: true },
        },
        _sum: { score: true },
      }),
      client.marathonWeeklyScore.aggregate({
        where: {
          userId: student.id,
          completed: true,
          contest: { isConfirmed: true },
        },
        _sum: { score: true },
      }),
    ]);

    const totalScore = (dailySum._sum.score || 0) + (weeklySum._sum.score || 0);
    if (student.marathonTotalScore !== totalScore) {
      await client.user.update({
        where: { id: student.id },
        data: { marathonTotalScore: totalScore },
      });
      totalUpdated++;
    }
  }

  return { totalUpdated };
}
