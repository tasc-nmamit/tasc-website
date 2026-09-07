import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: Context) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const form = await db.form.findUnique({
      where: { id },
      include: { fields: true },
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

    if (existing && !form.allowEdit) {
      return NextResponse.json({ error: "You have already submitted a response for this form and editing is not allowed." }, { status: 400 });
    }

    const { answers } = await request.json();

    // Validate required fields and number thresholds
    for (const field of form.fields) {
      const val = answers[field.id];
      if (field.isRequired && (val === undefined || val === null || val === "")) {
        return NextResponse.json({ error: `Field '${field.label}' is required` }, { status: 400 });
      }

      if (field.type === "NUMBER" && val !== undefined && val !== null && val !== "") {
        const numVal = Number(val);
        if (isNaN(numVal)) {
          return NextResponse.json({ error: `Field '${field.label}' must be a valid number` }, { status: 400 });
        }
        const opts = (field.options as { min?: number | null; max?: number | null }) || {};
        if (opts.min !== undefined && opts.min !== null && numVal < opts.min) {
          return NextResponse.json({ error: `Field '${field.label}' cannot be less than ${opts.min}` }, { status: 400 });
        }
        if (opts.max !== undefined && opts.max !== null && numVal > opts.max) {
          return NextResponse.json({ error: `Field '${field.label}' cannot exceed ${opts.max}` }, { status: 400 });
        }
      }
    }

    const response = await db.formResponse.upsert({
      where: { formId_userId: { formId: id, userId: session.user.id } },
      update: {
        answers,
      },
      create: {
        formId: id,
        userId: session.user.id,
        answers,
      }
    });

    return NextResponse.json({ success: true, responseId: response.id });
  } catch (error: any) {
    console.error("Form submit error:", error);
    return NextResponse.json({ error: "Failed to submit form: " + error.message }, { status: 500 });
  }
}
