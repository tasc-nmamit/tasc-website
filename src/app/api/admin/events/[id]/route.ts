import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { EventStatus, EventType } from "@prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.venue !== undefined) updateData.venue = body.venue;
    if (body.time !== undefined) updateData.time = body.time;
    if (body.type !== undefined) updateData.type = body.type as EventType;
    if (body.status !== undefined) updateData.status = body.status as EventStatus;
    if (body.published !== undefined) updateData.published = !!body.published;
    if (body.registrationsAvailable !== undefined) {
      updateData.registrationsAvailable = !!body.registrationsAvailable;
    }

    if (body.date !== undefined && body.date) {
      updateData.date = new Date(body.date);
    }

    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    }

    if (body.minTeamSize !== undefined) {
      updateData.minTeamSize = Number(body.minTeamSize) || 1;
    }
    if (body.maxTeamSize !== undefined) {
      updateData.maxTeamSize = Number(body.maxTeamSize) || 1;
    }
    if (body.maxTeams !== undefined) {
      updateData.maxTeams = body.maxTeams ? Number(body.maxTeams) : null;
    }

    if (body.gallery !== undefined && Array.isArray(body.gallery)) {
      updateData.guests = body.gallery;
    }

    if (body.galleryPublished !== undefined) {
      updateData.notification = body.galleryPublished ? "GALLERY_PUBLISHED" : "GALLERY_DRAFT";
    }

    const event = await db.event.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(event);
  } catch (error: any) {
    console.error("Failed to update event:", error);
    return NextResponse.json({ error: "Failed to update event: " + error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    await db.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete event:", error);
    return NextResponse.json({ error: "Failed to delete event: " + error.message }, { status: 500 });
  }
}
