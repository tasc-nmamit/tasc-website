import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseContestDate } from "@/lib/date-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await db.form.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete form" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      published,
      startTime,
      endTime,
      requireAiml,
      allowEdit,
      allowAnonymous,
      fields,
    } = body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (published !== undefined) data.published = Boolean(published);
    if (startTime !== undefined) data.startTime = startTime ? parseContestDate(startTime) : null;
    if (endTime !== undefined) data.endTime = endTime ? parseContestDate(endTime) : null;
    if (requireAiml !== undefined) {
      data.requireAiml = Boolean(requireAiml);
      if (data.requireAiml) {
        data.allowAnonymous = false;
      }
    }
    if (allowEdit !== undefined) data.allowEdit = Boolean(allowEdit);
    if (allowAnonymous !== undefined && !data.requireAiml) {
      data.allowAnonymous = Boolean(allowAnonymous);
    }

    // If fields are passed, carefully update/create/delete
    if (fields && Array.isArray(fields)) {
      const existingFields = await db.formField.findMany({
        where: { formId: id },
      });
      const submittedIds = new Set(fields.filter((f) => f.id).map((f) => f.id));

      // Remove deleted fields
      const toDelete = existingFields.filter((f) => !submittedIds.has(f.id));
      if (toDelete.length > 0) {
        await db.formField.deleteMany({
          where: { id: { in: toDelete.map((f) => f.id) } },
        });
      }

      // Update or create fields
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        if (f.id && existingFields.some((ef) => ef.id === f.id)) {
          await db.formField.update({
            where: { id: f.id },
            data: {
              label: f.label,
              type: f.type,
              isRequired: Boolean(f.isRequired),
              options: f.options ?? null,
              order: i,
            },
          });
        } else {
          await db.formField.create({
            data: {
              formId: id,
              label: f.label,
              type: f.type,
              isRequired: Boolean(f.isRequired),
              options: f.options ?? null,
              order: i,
            },
          });
        }
      }
    }

    const updatedForm = await db.form.update({
      where: { id },
      data,
      include: {
        fields: { orderBy: { order: "asc" } },
        _count: { select: { responses: true } },
      },
    });

    return NextResponse.json(updatedForm);
  } catch (error: any) {
    console.error("Failed to update form:", error);
    return NextResponse.json({ error: "Failed to update form: " + error.message }, { status: 500 });
  }
}
