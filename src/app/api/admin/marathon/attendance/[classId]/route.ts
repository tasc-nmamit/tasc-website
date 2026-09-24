import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { recalculateTotalScores } from "@/lib/marathon-streak";

interface Context {
  params: Promise<{ classId: string }>;
}

export async function GET(request: Request, context: Context) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { classId } = await context.params;

  try {
    const marathonClass = await db.marathonClass.findUnique({
      where: { id: classId },
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
          orderBy: [
            { batch: "asc" },
            { user: { usn: "asc" } },
            { user: { name: "asc" } },
          ],
        },
      },
    });

    if (!marathonClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(marathonClass);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch class: " + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: Context) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { classId } = await context.params;

  try {
    const body = await request.json();
    const { attendanceUpdates, topic } = body;

    // Optional topic update
    if (topic !== undefined) {
      await db.marathonClass.update({
        where: { id: classId },
        data: { topic: topic?.trim() || null },
      });
    }

    // Attendance toggles / updates
    if (Array.isArray(attendanceUpdates) && attendanceUpdates.length > 0) {
      for (const update of attendanceUpdates) {
        if (update.id) {
          await db.marathonAttendance.update({
            where: { id: update.id },
            data: { present: !!update.present },
          });
        } else if (update.userId) {
          await db.marathonAttendance.updateMany({
            where: { classId, userId: update.userId },
            data: { present: !!update.present },
          });
        }
      }
    }

    // Recalculate leaderboard scores to reflect updated attendance
    await recalculateTotalScores();

    const updated = await db.marathonClass.findUnique({
      where: { id: classId },
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
          orderBy: [
            { batch: "asc" },
            { user: { usn: "asc" } },
            { user: { name: "asc" } },
          ],
        },
      },
    });

    return NextResponse.json({ success: true, class: updated });
  } catch (error: any) {
    console.error("PATCH attendance error:", error);
    return NextResponse.json(
      { error: "Failed to update attendance: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: Context) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { classId } = await context.params;

  try {
    await db.marathonClass.delete({
      where: { id: classId },
    });

    // Recalculate scores
    await recalculateTotalScores();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE marathon class error:", error);
    return NextResponse.json(
      { error: "Failed to delete class: " + error.message },
      { status: 500 }
    );
  }
}
