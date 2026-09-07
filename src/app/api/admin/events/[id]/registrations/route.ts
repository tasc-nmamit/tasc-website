import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-guards";
import { generateUniqueTeamCode } from "@/lib/team-code";

// Add user or create team manually by Admin
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "OWNER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, userId, leaderId, teamName, teamId, responses } = body;

    const event = await db.event.findUnique({
      where: { id },
      include: {
        customFields: true,
      },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // ACTION: Add member to an existing team
    if (action === "ADD_MEMBER") {
      const targetUserId = userId;
      if (!targetUserId || !teamId) {
        return new NextResponse("User ID and Team ID are required", { status: 400 });
      }

      const user = await db.user.findUnique({ where: { id: targetUserId } });
      if (!user) return new NextResponse("User not found", { status: 404 });

      const team = await db.team.findUnique({
        where: { id: teamId },
        include: { registrations: true },
      });
      if (!team) return new NextResponse("Team not found", { status: 404 });

      // Check if user is already registered for this event
      const existingReg = await db.eventRegistration.findFirst({
        where: {
          userId: targetUserId,
          team: { eventId: id },
        },
      });
      if (existingReg) {
        return new NextResponse("User already registered in this event", { status: 400 });
      }

      if (team.registrations.length >= event.maxTeamSize) {
        return new NextResponse("Team is already full", { status: 400 });
      }

      await db.eventRegistration.create({
        data: {
          userId: targetUserId,
          teamId,
        },
      });

      return NextResponse.json({ message: "Member added to team successfully" });
    }

    // ACTION: Create new team (or register solo user)
    const targetLeaderId = leaderId || userId;
    if (!targetLeaderId) {
      return new NextResponse("Team Leader / User ID is required", { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: targetLeaderId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    // Check if already registered
    const existingReg = await db.eventRegistration.findFirst({
      where: {
        userId: targetLeaderId,
        team: { eventId: id },
      },
    });
    if (existingReg) {
      return new NextResponse("User already registered for this event", { status: 400 });
    }

    const assignedName = teamName || (event.type === "SOLO" ? null : `${user.displayName || user.name || "Student"}'s Team`);
    const teamCode = event.type === "SOLO" ? null : await generateUniqueTeamCode();

    const team = await db.team.create({
      data: {
        name: assignedName,
        eventId: id,
        leaderId: targetLeaderId,
        teamCode,
        status: "CONFIRMED",
        customFieldResponses: responses ?? undefined,
      },
    });

    await db.eventRegistration.create({
      data: {
        userId: targetLeaderId,
        teamId: team.id,
        customFieldResponses: responses ?? undefined,
      },
    });

    return NextResponse.json({ message: "Team registered successfully", teamCode });
  } catch (error: any) {
    console.error("[ADMIN_REGISTRATION_POST]", error);
    return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
  }
}

// Remove user registration or entire team by Admin
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "OWNER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const teamId = searchParams.get("teamId");

    // Delete entire team
    if (teamId && !userId) {
      await db.team.delete({
        where: { id: teamId },
      });
      return NextResponse.json({ message: "Team deleted successfully" });
    }

    if (!userId) {
      return new NextResponse("User ID or Team ID is required", { status: 400 });
    }

    // Find the registration
    const reg = await db.eventRegistration.findFirst({
      where: {
        userId,
        team: { eventId: id },
      },
      include: {
        team: {
          include: { registrations: true },
        },
      },
    });

    if (!reg) {
      return new NextResponse("Registration not found", { status: 404 });
    }

    // If only 1 person in the team or user is leader and team has <= 1 member, delete the team
    if (reg.team.registrations.length <= 1) {
      await db.team.delete({
        where: { id: reg.teamId },
      });
    } else {
      // Remove just this member
      await db.eventRegistration.delete({
        where: { id: reg.id },
      });

      // If leader left, reassign leader to another member
      if (reg.team.leaderId === userId) {
        const remaining = reg.team.registrations.filter((r) => r.userId !== userId);
        if (remaining.length > 0) {
          await db.team.update({
            where: { id: reg.teamId },
            data: { leaderId: remaining[0].userId },
          });
        }
      }
    }

    return NextResponse.json({ message: "Registration removed successfully" });
  } catch (error: any) {
    console.error("[ADMIN_REGISTRATION_DELETE]", error);
    return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
  }
}
