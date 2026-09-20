import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TeamSection } from "@prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { image, post, order, section, quote } = body;

    const updateData: Record<string, any> = {};
    if (image !== undefined) updateData.image = image;
    if (post !== undefined) updateData.post = post;
    if (order !== undefined) updateData.order = Number(order);
    if (section !== undefined) updateData.section = section as TeamSection;
    if (quote !== undefined) updateData.quote = quote || null;

    const member = await db.core.update({
      where: { id },
      data: updateData,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            displayName: true,
            email: true,
            image: true,
            links: {
              select: {
                instagram: true,
                linkedin: true,
                github: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(member);
  } catch (error: any) {
    console.error("Failed to update team member:", error);
    return NextResponse.json(
      { error: "Failed to update team member: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;

    await db.core.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete team member:", error);
    return NextResponse.json(
      { error: "Failed to delete team member: " + error.message },
      { status: 500 }
    );
  }
}
