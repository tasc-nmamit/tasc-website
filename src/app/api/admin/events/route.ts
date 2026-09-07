import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { EventStatus, EventType } from "@prisma";

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
      image,
      date,
      time,
      endDate,
      venue,
      type, // SOLO | TEAM
      status, // DRAFT | UPCOMING | ONGOING | COMPLETED
      minTeamSize,
      maxTeamSize,
      maxTeams,
      brief,
      published,
      registrationsAvailable,
      customFields,
    } = body;

    const isPublished = published !== undefined ? published : (status !== "DRAFT");

    const event = await db.event.create({
      data: {
        title,
        description,
        image,
        date: new Date(date),
        time,
        endDate: endDate ? new Date(endDate) : null,
        venue,
        type: type as EventType,
        status: status as EventStatus,
        minTeamSize: type === "SOLO" ? 1 : minTeamSize || 1,
        maxTeamSize: type === "SOLO" ? 1 : maxTeamSize || 1,
        maxTeams: maxTeams ? parseInt(maxTeams) : null,
        brief: "",
        registrationsAvailable,
        published: isPublished,
        organizers: {
          connect: { id: session.user.id }
        },
        customFields: {
          create: customFields?.map((cf: any, index: number) => ({
            label: cf.label,
            fieldType: cf.fieldType || "TEXT",
            isRequired: !!cf.isRequired,
            options: cf.options || null,
            order: index,
          })) || [],
        },
      },
    });

    return NextResponse.json(event);
  } catch (error: any) {
    console.error("Failed to create event:", error);
    return NextResponse.json({ error: "Failed to create event: " + error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const events = await db.event.findMany({
      orderBy: { date: "desc" },
      include: {
        _count: {
          select: { participants: true },
        },
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
