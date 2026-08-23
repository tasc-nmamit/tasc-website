import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma";

export async function PATCH(request: Request) {
  const session = await auth();

  // Only OWNER can change roles
  if (!session?.user?.id || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 }
      );
    }

    // Can only set USER or ADMIN (not OWNER)
    if (role !== Role.USER && role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Can only set role to USER or ADMIN" },
        { status: 400 }
      );
    }

    // Cannot change own role
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    // Prevent changing another OWNER's role
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role === Role.OWNER) {
      return NextResponse.json(
        { error: "Cannot change an OWNER's role" },
        { status: 403 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: role as Role },
      select: { id: true, role: true, email: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Role update error:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
