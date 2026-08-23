import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const form = await db.form.findUnique({
      where: { id },
      include: {
        fields: { orderBy: { order: "asc" } }
      }
    });

    if (!form || !form.published) {
      return NextResponse.json({ error: "Form not found or unavailable" }, { status: 404 });
    }

    const now = new Date();
    if (form.startTime && now < form.startTime) {
      return NextResponse.json({ error: "Form is not open yet" }, { status: 400 });
    }
    if (form.endTime && now > form.endTime) {
      return NextResponse.json({ error: "Form has closed" }, { status: 400 });
    }

    if (form.requireAiml && !session.user.isAiml) {
      return NextResponse.json({ error: "This form is restricted to AIML students" }, { status: 403 });
    }

    // Check if already responded
    const existing = await db.formResponse.findUnique({
      where: { formId_userId: { formId: id, userId: session.user.id } }
    });

    if (existing) {
      if (!form.allowEdit) {
        return NextResponse.json({ error: "You have already submitted a response for this form" }, { status: 400 });
      } else {
        // Return form with existing answers
        return NextResponse.json({ ...form, existingAnswers: existing.answers });
      }
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Form fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch form data" }, { status: 500 });
  }
}
