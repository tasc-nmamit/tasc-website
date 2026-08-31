import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-guards";

// Add user registration
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
    const { userId } = body;

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const event = await db.event.findUnique({
      where: { id },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if already registered
    const existingReg = await db.eventRegistration.findFirst({
      where: {
        userId,
        team: { eventId: id },
      },
    });

    if (existingReg) {
      return new NextResponse("User already registered", { status: 400 });
    }

    // Create a team just for them (solo team basically)
    const teamName = `${user.displayName || user.name || "User"}'s Team`;
    
    await db.eventTeam.create({
      data: {
        name: teamName,
        eventId: id,
        leaderId: userId,
        members: {
          create: {
            userId,
          },
        },
      },
    });

    return NextResponse.json({ message: "Registration successful" });
  } catch (error) {
    console.error("[ADMIN_REGISTRATION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Remove user registration
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

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Find the registration
    const reg = await db.eventRegistration.findFirst({
      where: {
        userId,
        team: { eventId: id },
      },
      include: {
        team: true,
      },
    });

    if (!reg) {
      return new NextResponse("Registration not found", { status: 404 });
    }

    // Delete the team (which will cascade delete registrations)
    // Only delete the team if they are the leader, or just delete the registration if they are a member.
    // To simplify for admins, we just remove the team entirely if they are the leader, or remove from team if member.
    if (reg.team.leaderId === userId) {
      await db.eventTeam.delete({
        where: { id: reg.teamId },
      });
    } else {
      await db.eventRegistration.delete({
        where: { id: reg.id },
      });
    }

    return NextResponse.json({ message: "Registration removed" });
  } catch (error) {
    console.error("[ADMIN_REGISTRATION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
