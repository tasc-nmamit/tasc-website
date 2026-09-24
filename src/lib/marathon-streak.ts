import { db } from "@/lib/db";
import { getBatchForUser, MarathonBatch } from "@/lib/marathon-batches";
import { isNmamitEmail } from "@/lib/email-parser";

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
 * Recalculates total score for all students based on confirmed daily & weekly contests
 * and attended marathon classes.
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
    const [dailySum, weeklySum, presentCount] = await Promise.all([
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
      client.marathonAttendance.count({
        where: {
          userId: student.id,
          present: true,
        },
      }),
    ]);

    // Attended marathon classes contribute 25 points each
    const attendancePoints = presentCount * 25;
    const totalScore = (dailySum._sum.score || 0) + (weeklySum._sum.score || 0) + attendancePoints;

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

/**
 * Returns attendance statistics (total classes, attended count, percentage, batch, and records) for a user.
 * Automatically synchronizes attendance for newly joined students or missing classes for their batch.
 */
export async function getUserAttendanceStats(userId: string, client: any = db) {
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, usn: true, name: true, isAiml: true },
  });

  let userBatch: MarathonBatch | null = null;

  if (user) {
    if (!user.usn && user.email && isNmamitEmail(user.email)) {
      user.usn = user.email.split("@")[0].toUpperCase();
      await client.user.update({
        where: { id: user.id },
        data: { usn: user.usn },
      });
    }

    userBatch = getBatchForUser(user);

    if (userBatch) {
      // Find all classes that include user's batch
      const batchClasses = await client.marathonClass.findMany({
        where: {
          batches: {
            has: userBatch,
          },
        },
        select: { id: true },
      });

      if (batchClasses.length > 0) {
        const existingAttendance = await client.marathonAttendance.findMany({
          where: {
            userId: user.id,
            classId: { in: batchClasses.map((c: any) => c.id) },
          },
          select: { classId: true },
        });

        const existingIds = new Set(existingAttendance.map((a: any) => a.classId));
        const missing = batchClasses.filter((c: any) => !existingIds.has(c.id));

        if (missing.length > 0) {
          await client.marathonAttendance.createMany({
            data: missing.map((c: any) => ({
              classId: c.id,
              userId: user.id,
              batch: userBatch!,
              present: true,
            })),
            skipDuplicates: true,
          });
        }
      }
    }
  }

  const records = await client.marathonAttendance.findMany({
    where: { userId },
    include: {
      class: {
        select: { id: true, date: true, topic: true, batches: true },
      },
    },
    orderBy: { class: { date: "desc" } },
  });

  const totalClasses = records.length;
  const presentClasses = records.filter((r: any) => r.present).length;
  const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

  return {
    batch: userBatch,
    totalClasses,
    presentClasses,
    percentage,
    records,
  };
}
