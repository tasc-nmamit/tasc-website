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
      slug: customSlug,
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
      registrationStartTime,
      customFields,
    } = body;

    const isPublished = published !== undefined ? published : (status !== "DRAFT");

    // Generate or clean slug
    const { slugify } = await import("@/lib/slug");
    let baseSlug = (customSlug && customSlug.trim())
      ? slugify(customSlug)
      : slugify(title || "event");
    if (!baseSlug) baseSlug = `event-${Date.now().toString(36)}`;

    let finalSlug = baseSlug;
    let counter = 1;
    while (await db.event.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const event = await db.event.create({
      data: {
        title,
        slug: finalSlug,
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
        registrationStartTime: registrationStartTime ? new Date(registrationStartTime) : null,
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
