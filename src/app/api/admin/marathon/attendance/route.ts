import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getBatchForUser, MarathonBatch } from "@/lib/marathon-batches";
import { recalculateTotalScores } from "@/lib/marathon-streak";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // 1-12
    const year = searchParams.get("year");   // e.g. 2026

    let dateFilter: any = {};
    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const startDate = new Date(Date.UTC(y, m - 1, 1));
      const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    // Fetch classes with attendance
    const classes = await db.marathonClass.findMany({
      where: dateFilter,
      orderBy: { date: "desc" },
      include: {
        attendance: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                usn: true,
                year: true,
                branch: true,
              },
            },
          },
          orderBy: [
            { batch: "asc" },
            { user: { usn: "asc" } },
            { user: { name: "asc" } },
          ],
        },
      },
    });

    // Also fetch all AIML students annotated with their resolved batch
    const allAimlStudents = await db.user.findMany({
      where: {
        isAiml: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        usn: true,
        year: true,
        branch: true,
      },
      orderBy: [
        { usn: "asc" },
        { name: "asc" },
      ],
    });

    const studentsWithBatch = allAimlStudents.map((s) => ({
      ...s,
      batch: getBatchForUser(s),
    }));

    return NextResponse.json({
      classes,
      students: studentsWithBatch,
    });
  } catch (error: any) {
    console.error("GET marathon attendance error:", error);
    return NextResponse.json(
      { error: "Failed to load attendance: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { date, batches, topic } = body;

    if (!date) {
      return NextResponse.json({ error: "Class date is required" }, { status: 400 });
    }

    if (!Array.isArray(batches) || batches.length === 0) {
      return NextResponse.json({ error: "Select at least one batch" }, { status: 400 });
    }

    // 1. Create MarathonClass
    const classDate = new Date(date);
    const newClass = await db.marathonClass.create({
      data: {
        date: classDate,
        batches: batches as string[],
        topic: topic?.trim() || null,
      },
    });

    // 2. Fetch all AIML students
    const aimlStudents = await db.user.findMany({
      where: {
        isAiml: true,
      },
      select: {
        id: true,
        email: true,
        usn: true,
      },
    });

    // 3. Resolve students belonging to any of the selected batches
    const targetBatchesSet = new Set(batches);
    const attendanceRecordsToCreate: {
      classId: string;
      userId: string;
      batch: string;
      present: boolean;
    }[] = [];

    for (const student of aimlStudents) {
      const studentBatch = getBatchForUser(student);
      if (studentBatch && targetBatchesSet.has(studentBatch)) {
        attendanceRecordsToCreate.push({
          classId: newClass.id,
          userId: student.id,
          batch: studentBatch,
          present: true, // Default to present as per user requirement!
        });
      }
    }

    // 4. Batch create attendance records
    if (attendanceRecordsToCreate.length > 0) {
      await db.marathonAttendance.createMany({
        data: attendanceRecordsToCreate,
        skipDuplicates: true,
      });
    }

    // 5. Recalculate marathon total scores
    await recalculateTotalScores();

    // 6. Return created class with attendance
    const createdWithAttendance = await db.marathonClass.findUnique({
      where: { id: newClass.id },
      include: {
        attendance: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                usn: true,
                year: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      class: createdWithAttendance,
      studentsCount: attendanceRecordsToCreate.length,
    });
  } catch (error: any) {
    console.error("POST marathon class error:", error);
    return NextResponse.json(
      { error: "Failed to schedule class: " + error.message },
      { status: 500 }
    );
  }
}
