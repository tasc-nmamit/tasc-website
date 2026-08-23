import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const form = await db.form.findUnique({
      where: { id },
      include: {
        fields: { orderBy: { order: "asc" } },
        responses: {
          include: { user: true }
        }
      }
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Flatten data for export
    const exportData = [];

    for (const res of form.responses) {
      const row: any = {
        "Name": res.user.name || res.user.email,
        "Email": res.user.email,
        "USN": res.user.usn || "N/A",
        "Branch": res.user.branch || "N/A",
        "Year": res.user.year || "N/A",
        "Submission Date": res.createdAt.toISOString(),
      };

      // Add answers
      const answers = res.answers as Record<string, string> || {};
      for (const field of form.fields) {
        row[field.label] = answers[field.id] || "N/A";
      }

      exportData.push(row);
    }

    return NextResponse.json({ 
      formTitle: form.title,
      data: exportData 
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to generate export data" }, { status: 500 });
  }
}
