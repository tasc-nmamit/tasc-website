import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma";

export async function PATCH(request: Request) {
  const session = await auth();

  // Both ADMIN and OWNER can update user attributes like isAiml
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, isAiml } = body;

    if (!userId || typeof isAiml !== "boolean") {
      return NextResponse.json(
        { error: "userId and isAiml (boolean) are required" },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { isAiml },
      select: { id: true, email: true, isAiml: true },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Failed to update user isAiml:", error);
    return NextResponse.json(
      { error: "Failed to update user: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  // Only OWNER can delete users
  if (!session?.user?.id || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Cannot delete yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Prevent deleting another OWNER
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role === Role.OWNER) {
      return NextResponse.json(
        { error: "Cannot delete an OWNER account" },
        { status: 403 }
      );
    }

    // Delete the user
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
