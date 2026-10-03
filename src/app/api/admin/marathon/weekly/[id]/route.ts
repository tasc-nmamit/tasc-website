import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { slug, date, deadline } = await request.json();
    const params = await context.params;

    const data: any = {};
    if (slug !== undefined) data.slug = slug;
    if (date !== undefined) data.date = new Date(date);
    if (deadline !== undefined) data.deadline = new Date(deadline);

    const updated = await db.marathonWeeklyContest.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const params = await context.params;
    const contest = await db.marathonWeeklyContest.findUnique({
      where: { id: params.id },
      include: { scores: true }
    });

    if (!contest) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.$transaction(async (tx) => {
      // Deduct points if confirmed
      if (contest.isConfirmed) {
        for (const score of contest.scores) {
          if (score.score > 0) {
            await tx.user.update({
              where: { id: score.userId },
              data: { marathonTotalScore: { decrement: score.score } }
            });
          }
        }
      }

      await tx.marathonWeeklyContest.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
