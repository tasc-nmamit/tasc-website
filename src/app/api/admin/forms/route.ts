import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      published,
      startTime,
      endTime,
      requireAiml,
      fields,
    } = body;

    const form = await db.form.create({
      data: {
        title,
        description,
        published,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        requireAiml,
        fields: {
          create: fields.map((f: any, index: number) => ({
            label: f.label,
            type: f.type,
            isRequired: f.isRequired,
            options: f.options,
            order: index,
          })),
        },
      },
    });

    return NextResponse.json(form);
  } catch (error: any) {
    console.error("Failed to create form:", error);
    return NextResponse.json({ error: "Failed to create form: " + error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const forms = await db.form.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { responses: true },
        },
      }
    });

    return NextResponse.json(forms);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
  }
}
