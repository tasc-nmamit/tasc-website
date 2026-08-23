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
    const event = await db.event.findUnique({
      where: { id },
      include: {
        customFields: { orderBy: { order: "asc" } },
        participants: {
          include: {
            registrations: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Flatten data for export
    const exportData = [];

    for (const team of event.participants) {
      for (const reg of team.registrations) {
        const row: any = {
          "Team Name": team.name || "N/A",
          "Team Code": team.teamCode || "N/A",
          "Team Status": team.status,
          "Is Leader": team.leaderId === reg.userId ? "Yes" : "No",
          "Name": reg.user.name || reg.user.email,
          "Email": reg.user.email,
          "USN": reg.user.usn || "N/A",
          "Branch": reg.user.branch || "N/A",
          "Year": reg.user.year || "N/A",
          "Registration Date": reg.createdAt.toISOString(),
        };

        // Add custom field responses
        const responses = reg.customFieldResponses as Record<string, string> || {};
        for (const field of event.customFields) {
          row[field.label] = responses[field.id] || "N/A";
        }

        exportData.push(row);
      }
    }

    return NextResponse.json({ 
      eventTitle: event.title,
      data: exportData 
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to generate export data" }, { status: 500 });
  }
}
