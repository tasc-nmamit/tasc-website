import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateUniqueTeamCode } from "@/lib/team-code";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: Context) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const event = await db.event.findUnique({
      where: { id },
      include: {
        customFields: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.registrationsAvailable) {
      return NextResponse.json(
        { error: "Registrations are closed" },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const existingReg = await db.eventRegistration.findFirst({
      where: {
        userId: session.user.id,
        team: {
          eventId: id,
        },
      },
    });

    return NextResponse.json({
      event,
      isRegistered: !!existingReg,
    });
  } catch (error) {
    console.error("GET event register error:", error);
    return NextResponse.json(
      { error: "Failed to load event data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: Context) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { action, teamName, teamCode, responses } = body;

    const event = await db.event.findUnique({
      where: { id },
      include: { participants: { include: { registrations: true } } },
    });

    if (!event || !event.registrationsAvailable) {
      return NextResponse.json(
        { error: "Event not available for registration" },
        { status: 400 }
      );
    }

    // Check if already registered
    const existingReg = await db.eventRegistration.findFirst({
      where: { userId: session.user.id, team: { eventId: id } },
    });

    if (existingReg) {
      return NextResponse.json(
        { error: "Already registered for this event" },
        { status: 400 }
      );
    }

    // Validate max teams / total size
    if (event.maxTeams && event.participants.length >= event.maxTeams) {
      return NextResponse.json(
        { error: "Event has reached maximum capacity" },
        { status: 400 }
      );
    }

    // Helper to validate custom fields
    const customFields = await db.eventCustomField.findMany({
      where: { eventId: id },
    });

    for (const field of customFields) {
      if (field.isRequired && !responses[field.id]) {
        return NextResponse.json(
          { error: `Field '${field.label}' is required` },
          { status: 400 }
        );
      }
    }

    if (event.type === "SOLO") {
      // Create a dummy "Team" for the solo user
      const team = await db.team.create({
        data: {
          eventId: id,
          leaderId: session.user.id,
          status: "CONFIRMED", // Solo teams are auto-confirmed
        },
      });

      await db.eventRegistration.create({
        data: {
          userId: session.user.id,
          teamId: team.id,
          customFieldResponses: responses,
        },
      });

      return NextResponse.json({ success: true });
    } else {
      // TEAM EVENT
      if (action === "CREATE") {
        const newTeamCode = await generateUniqueTeamCode();

        const team = await db.team.create({
          data: {
            eventId: id,
            name: teamName,
            leaderId: session.user.id,
            teamCode: newTeamCode,
            status: event.minTeamSize === 1 ? "CONFIRMED" : "PENDING",
          },
        });

        await db.eventRegistration.create({
          data: {
            userId: session.user.id,
            teamId: team.id,
            customFieldResponses: responses,
          },
        });

        return NextResponse.json({ success: true, teamCode: newTeamCode });
      } else if (action === "JOIN") {
        const team = await db.team.findUnique({
          where: { teamCode },
          include: { registrations: true },
        });

        if (!team) {
          return NextResponse.json({ error: "Invalid team code" }, { status: 400 });
        }

        if (team.eventId !== id) {
          return NextResponse.json({ error: "Team code belongs to a different event" }, { status: 400 });
        }

        if (team.registrations.length >= event.maxTeamSize) {
          return NextResponse.json({ error: "Team is already full" }, { status: 400 });
        }

        await db.eventRegistration.create({
          data: {
            userId: session.user.id,
            teamId: team.id,
            customFieldResponses: responses,
          },
        });

        // Auto-confirm team if minimum threshold is met
        if (team.status === "PENDING" && team.registrations.length + 1 >= event.minTeamSize) {
          await db.team.update({
            where: { id: team.id },
            data: { status: "CONFIRMED" },
          });
        }

        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Invalid team action" }, { status: 400 });
    }
  } catch (error) {
    console.error("POST event register error:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
}
