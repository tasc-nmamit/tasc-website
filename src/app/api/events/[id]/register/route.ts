import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateUniqueTeamCode } from "@/lib/team-code";
import { getEventDateTimes } from "@/lib/date-utils";

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
    const event = await db.event.findFirst({
      where: {
        OR: [{ slug: id }, { id: id }],
      },
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
          eventId: event.id,
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
    const { action, teamName, teamCode, responses, format, memberId, registrationId } = body;

    const event = await db.event.findFirst({
      where: {
        OR: [{ slug: id }, { id: id }],
      },
      include: { participants: { include: { registrations: true } } },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if event is concluded
    const { isPast, isScheduled } = getEventDateTimes(event);
    if (isPast) {
      return NextResponse.json(
        { error: "Event has already concluded" },
        { status: 400 }
      );
    }

    // --- Action: CONFIRM_TEAM ---
    if (action === "CONFIRM_TEAM") {
      const team = await db.team.findFirst({
        where: {
          eventId: event.id,
          leaderId: session.user.id,
        },
        include: { registrations: true },
      });

      if (!team) {
        return NextResponse.json(
          { error: "Only the team leader can confirm the team" },
          { status: 403 }
        );
      }

      if (team.status === "CONFIRMED") {
        return NextResponse.json(
          { error: "Team is already confirmed" },
          { status: 400 }
        );
      }

      if (team.registrations.length < event.minTeamSize) {
        return NextResponse.json(
          { error: `Team must have at least ${event.minTeamSize} member(s) before confirming` },
          { status: 400 }
        );
      }

      if (team.registrations.length > event.maxTeamSize) {
        return NextResponse.json(
          { error: `Team cannot exceed ${event.maxTeamSize} member(s)` },
          { status: 400 }
        );
      }

      await db.team.update({
        where: { id: team.id },
        data: {
          status: "CONFIRMED",
          isConfirmed: true,
        },
      });

      return NextResponse.json({ success: true, message: "Team confirmed successfully!" });
    }

    // --- Action: REMOVE_MEMBER ---
    if (action === "REMOVE_MEMBER") {
      const team = await db.team.findFirst({
        where: {
          eventId: event.id,
          leaderId: session.user.id,
        },
        include: { registrations: true },
      });

      if (!team) {
        return NextResponse.json(
          { error: "Only the team leader can remove members" },
          { status: 403 }
        );
      }

      if (team.status === "CONFIRMED") {
        return NextResponse.json(
          { error: "Team is already confirmed. Members cannot be removed." },
          { status: 400 }
        );
      }

      const targetMemberId = memberId || body.userId;
      const targetRegId = registrationId;

      if (!targetMemberId && !targetRegId) {
        return NextResponse.json(
          { error: "Member identifier is required to remove member" },
          { status: 400 }
        );
      }

      const targetReg = team.registrations.find(
        (r) =>
          (targetRegId && r.id === targetRegId) ||
          (targetMemberId && r.userId === targetMemberId)
      );

      if (!targetReg) {
        return NextResponse.json(
          { error: "Member not found in your team" },
          { status: 404 }
        );
      }

      if (targetReg.userId === session.user.id) {
        return NextResponse.json(
          { error: "Team leader cannot be removed from the team" },
          { status: 400 }
        );
      }

      await db.eventRegistration.delete({
        where: { id: targetReg.id },
      });

      return NextResponse.json({
        success: true,
        message: "Member removed from team successfully",
      });
    }

    // --- Action: QUIT_TEAM / LEAVE_TEAM ---
    if (action === "QUIT_TEAM" || action === "LEAVE_TEAM") {
      const userReg = await db.eventRegistration.findFirst({
        where: {
          userId: session.user.id,
          team: { eventId: event.id },
        },
        include: {
          team: {
            include: { registrations: true },
          },
        },
      });

      if (!userReg || !userReg.team) {
        return NextResponse.json(
          { error: "You are not registered in a team for this event" },
          { status: 400 }
        );
      }

      const team = userReg.team;

      if (team.status === "CONFIRMED") {
        return NextResponse.json(
          { error: "Team is already confirmed. Members cannot leave the team." },
          { status: 400 }
        );
      }

      if (team.leaderId === session.user.id) {
        return NextResponse.json(
          {
            error:
              "As team leader, you cannot quit the team. You can remove members or disband the team.",
          },
          { status: 400 }
        );
      }

      await db.eventRegistration.delete({
        where: { id: userReg.id },
      });

      return NextResponse.json({
        success: true,
        message: "You have left the team successfully",
      });
    }

    // --- Action: DISBAND_TEAM ---
    if (action === "DISBAND_TEAM") {
      const team = await db.team.findFirst({
        where: {
          eventId: event.id,
          leaderId: session.user.id,
        },
      });

      if (!team) {
        return NextResponse.json(
          { error: "Only the team leader can disband the team" },
          { status: 403 }
        );
      }

      if (team.status === "CONFIRMED") {
        return NextResponse.json(
          { error: "Team is already confirmed. Confirmed teams cannot be disbanded." },
          { status: 400 }
        );
      }

      await db.team.delete({
        where: { id: team.id },
      });

      return NextResponse.json({
        success: true,
        message: "Team disbanded successfully",
      });
    }

    // --- New Registration Flow (CREATE or JOIN) ---
    if (!event.registrationsAvailable) {
      return NextResponse.json(
        { error: "Event not available for registration" },
        { status: 400 }
      );
    }

    if (isScheduled) {
      return NextResponse.json(
        { error: "Registrations have not opened yet for this event" },
        { status: 400 }
      );
    }

    // Check if already registered
    const existingReg = await db.eventRegistration.findFirst({
      where: { userId: session.user.id, team: { eventId: event.id } },
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

    const actualFormat = format || (event.type === "SOLO" ? "SOLO" : "TEAM");

    if (action === "CREATE" || action === "JOIN") {
      // Validate custom fields and number thresholds
      const customFields = await db.eventCustomField.findMany({
        where: { eventId: event.id },
      });

      const activeCustomFields = customFields.filter((cf) => {
        // 1. Format check
        if (cf.registrationMode === "SOLO" && actualFormat !== "SOLO") return false;
        if (cf.registrationMode === "TEAM" && actualFormat !== "TEAM") return false;

        // 2. Team role check
        if (actualFormat === "TEAM") {
          // Teammates joining via code only answer fields designated for all members
          if (action === "JOIN" && cf.targetRole === "LEADER_ONLY") {
            return false;
          }
        }
        return true;
      });

      const fieldResponses = responses || {};

      for (const field of activeCustomFields) {
        if (field.fieldType === "DISPLAY_IMAGE") continue;

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

    if (actualFormat === "SOLO") {
      // Create a dummy "Team" for the solo user
      const team = await db.team.create({
        data: {
          eventId: event.id,
          leaderId: session.user.id,
          status: "CONFIRMED", // Solo teams are auto-confirmed
          isConfirmed: true,
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
            eventId: event.id,
            name: teamName,
            leaderId: session.user.id,
            teamCode: newTeamCode,
            status: "PENDING",
            isConfirmed: false,
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

        if (team.eventId !== event.id) {
          return NextResponse.json({ error: "Team code belongs to a different event" }, { status: 400 });
        }

        if (team.status === "CONFIRMED") {
          return NextResponse.json({ error: "Team roster has already been confirmed and locked" }, { status: 400 });
        }

        if (team.registrations.length >= event.maxTeamSize) {
          return NextResponse.json({ error: "Team is already full" }, { status: 400 });
        }

        await db.eventRegistration.create({
          data: {
            userId: session.user.id,
            teamId: team.id,
            customFieldResponses: responses ?? undefined,
          },
        });

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
