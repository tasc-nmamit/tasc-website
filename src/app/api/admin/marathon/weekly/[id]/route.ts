import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { slug } = await request.json();
    const params = await context.params;

    if (slug === undefined) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const updated = await db.marathonWeeklyContest.update({
      where: { id: params.id },
      data: { slug },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
