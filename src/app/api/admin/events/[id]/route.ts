import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { EventStatus, EventType } from "@prisma";
import { slugify } from "@/lib/slug";
import { combineDateAndTimeIST, parseContestDate } from "@/lib/date-utils";

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

    if (body.slug !== undefined) {
      let baseSlug = body.slug ? slugify(body.slug) : slugify(body.title || "event");
      if (!baseSlug) baseSlug = `event-${Date.now().toString(36)}`;
      let finalSlug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await db.event.findUnique({ where: { slug: finalSlug } });
        if (!existing || existing.id === id) {
          break;
        }
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = finalSlug;
    }

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.venue !== undefined) updateData.venue = body.venue;
    if (body.time !== undefined) updateData.time = body.time;
    if (body.status !== undefined) {
      updateData.status = body.status as EventStatus;
      if (body.published === undefined) {
        updateData.published = body.status !== "DRAFT";
      }
    }
    if (body.published !== undefined) {
      updateData.published = !!body.published;
      if (!body.published && body.status === undefined) {
        updateData.status = "DRAFT";
      }
    }
    if (body.registrationStartTime !== undefined) {
      updateData.registrationStartTime = body.registrationStartTime
        ? parseContestDate(body.registrationStartTime)
        : null;
    }
    if (body.registrationsAvailable !== undefined) {
      updateData.registrationsAvailable = !!body.registrationsAvailable;
    }

    if (body.date !== undefined && body.date) {
      updateData.date = combineDateAndTimeIST(body.date, body.time ?? undefined);
    }

    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? parseContestDate(body.endDate) : null;
    }

    if (body.type !== undefined) {
      updateData.type = body.type as EventType;
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

    if (body.customFields !== undefined && Array.isArray(body.customFields)) {
      const existingFields = await db.eventCustomField.findMany({
        where: { eventId: id },
      });
      const incomingIds = new Set(
        body.customFields.filter((cf: any) => cf.id).map((cf: any) => cf.id)
      );

      const fieldsToDelete = existingFields.filter((ef) => !incomingIds.has(ef.id));
      if (fieldsToDelete.length > 0) {
        await db.eventCustomField.deleteMany({
          where: { id: { in: fieldsToDelete.map((f) => f.id) } },
        });
      }

      for (let i = 0; i < body.customFields.length; i++) {
        const cf = body.customFields[i];
        const fieldData = {
          label: cf.label,
          fieldType: cf.fieldType || "TEXT",
          isRequired: cf.fieldType === "DISPLAY_IMAGE" ? false : !!cf.isRequired,
          options: cf.options || null,
          order: i,
          registrationMode: cf.registrationMode || "ALL",
          targetRole: cf.targetRole || "ALL_MEMBERS",
        };

        if (cf.id && existingFields.some((ef) => ef.id === cf.id)) {
          await db.eventCustomField.update({
            where: { id: cf.id },
            data: fieldData,
          });
        } else {
          await db.eventCustomField.create({
            data: {
              ...fieldData,
              eventId: id,
            },
          });
        }
      }
    }

    const event = await db.event.update({
      where: { id },
      data: updateData,
      include: {
        customFields: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { participants: true },
        },
      },
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
    await db.$transaction(async (tx) => {
      // 1. Delete associated winners
      await tx.winners.deleteMany({ where: { eventId: id } });

      // 2. Delete registrations and teams
      const teams = await tx.team.findMany({
        where: { eventId: id },
        select: { id: true },
      });
      const teamIds = teams.map((t) => t.id);
      if (teamIds.length > 0) {
        await tx.eventRegistration.deleteMany({
          where: { teamId: { in: teamIds } },
        });
        await tx.team.deleteMany({
          where: { eventId: id },
        });
      }

      // 3. Delete custom fields
      await tx.eventCustomField.deleteMany({
        where: { eventId: id },
      });

      // 4. Delete the event record
      await tx.event.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete event:", error);
    return NextResponse.json({ error: "Failed to delete event: " + error.message }, { status: 500 });
  }
}
