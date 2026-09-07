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

    const isLeaderOrSolo = event.type === "SOLO" || action === "CREATE";

    if (isLeaderOrSolo) {
      // Validate custom fields and number thresholds
      const customFields = await db.eventCustomField.findMany({
        where: { eventId: id },
      });

      const fieldResponses = responses || {};

      for (const field of customFields) {
        const val = fieldResponses[field.id];
        if (field.isRequired && (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0))) {
          return NextResponse.json(
            { error: `Field '${field.label}' is required` },
            { status: 400 }
          );
        }

        if (field.fieldType === "NUMBER" && val !== undefined && val !== null && val !== "") {
          const numVal = Number(val);
          if (isNaN(numVal)) {
            return NextResponse.json(
              { error: `Field '${field.label}' must be a valid number` },
              { status: 400 }
            );
          }
          const opts = (field.options as { min?: number | null; max?: number | null }) || {};
          if (opts.min !== undefined && opts.min !== null && numVal < opts.min) {
            return NextResponse.json(
              { error: `Field '${field.label}' cannot be less than ${opts.min}` },
              { status: 400 }
            );
          }
          if (opts.max !== undefined && opts.max !== null && numVal > opts.max) {
            return NextResponse.json(
              { error: `Field '${field.label}' cannot exceed ${opts.max}` },
              { status: 400 }
            );
          }
        }
      }
    }

    if (event.type === "SOLO") {
      // Create a dummy "Team" for the solo user
      const team = await db.team.create({
        data: {
          eventId: id,
          leaderId: session.user.id,
          status: "CONFIRMED", // Solo teams are auto-confirmed
          customFieldResponses: responses ?? undefined,
        },
      });

      await db.eventRegistration.create({
        data: {
          userId: session.user.id,
          teamId: team.id,
          customFieldResponses: responses ?? undefined,
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
            status: "PENDING",
            customFieldResponses: responses ?? undefined,
          },
        });

        await db.eventRegistration.create({
          data: {
            userId: session.user.id,
            teamId: team.id,
            customFieldResponses: responses ?? undefined,
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
            customFieldResponses: undefined, // Members joining via code don't need custom fields
          },
        });

        return NextResponse.json({ success: true });
      } else if (action === "CONFIRM_TEAM") {
        const team = await db.team.findFirst({
          where: {
            eventId: id,
            leaderId: session.user.id,
          },
          include: { registrations: true },
        });

        if (!team) {
          return NextResponse.json({ error: "Only the team leader can confirm the team" }, { status: 403 });
        }

        if (team.registrations.length < event.minTeamSize) {
          return NextResponse.json(
            { error: `Team must have at least ${event.minTeamSize} member(s) before confirming` },
            { status: 400 }
          );
        }

        await db.team.update({
          where: { id: team.id },
          data: { status: "CONFIRMED" },
        });

        return NextResponse.json({ success: true, message: "Team confirmed successfully!" });
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
