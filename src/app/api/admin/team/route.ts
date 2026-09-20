import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TeamSection } from "@prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const members = await db.core.findMany({
      orderBy: [{ year: "desc" }, { order: "asc" }],
      include: {
        User: {
          select: {
            id: true,
            name: true,
            displayName: true,
            email: true,
            image: true,
            links: {
              select: {
                instagram: true,
                linkedin: true,
                github: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(members);
  } catch (error: any) {
    console.error("Failed to fetch team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, year, image, post, order, section, quote } = body;

    if (!userId || !year || !image || !post || order === undefined || !section) {
      return NextResponse.json(
        { error: "Missing required fields: userId, year, image, post, order, section" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const member = await db.core.create({
      data: {
        userId,
        year,
        image,
        post,
        order: Number(order),
        section: section as TeamSection,
        quote: quote || null,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            displayName: true,
            email: true,
            image: true,
            links: {
              select: {
                instagram: true,
                linkedin: true,
                github: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(member);
  } catch (error: any) {
    console.error("Failed to create team member:", error);
    return NextResponse.json(
      { error: "Failed to create team member: " + error.message },
      { status: 500 }
    );
  }
}
