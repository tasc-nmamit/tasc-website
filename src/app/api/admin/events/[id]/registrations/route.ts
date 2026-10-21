import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-guards";
import { generateUniqueTeamCode } from "@/lib/team-code";
import { isAimlStudent } from "@/lib/email-parser";

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

    // Helper to resolve or create user
    const resolveOrCreateUser = async (data: {
      userId?: string;
      name?: string;
      email?: string;
      usn?: string;
      phone?: string;
      branch?: string;
      year?: number | string;
    }) => {
      if (data.userId) {
        const existing = await db.user.findUnique({ where: { id: data.userId } });
        if (existing) return existing;
      }

      const normalizedEmail = (data.email || "").trim().toLowerCase();
      if (!normalizedEmail) {
        throw new Error("Student email is required for registration.");
      }

      let user = await db.user.findUnique({ where: { email: normalizedEmail } });
      const isAiml = isAimlStudent(normalizedEmail);

      if (!user) {
        user = await db.user.create({
          data: {
            email: normalizedEmail,
            name: data.name?.trim() || null,
            displayName: data.name?.trim() || null,
            usn: data.usn?.trim().toUpperCase() || null,
            phone: data.phone?.trim() || null,
            branch: data.branch?.trim() || (isAiml ? "AIML" : null),
            year: data.year ? Number(data.year) : null,
            role: "USER",
            isAiml,
          },
        });
      } else {
        // Update missing profile fields
        const updateData: any = {};
        if (!user.name && data.name) updateData.name = data.name.trim();
        if (!user.displayName && data.name) updateData.displayName = data.name.trim();
        if (!user.usn && data.usn) updateData.usn = data.usn.trim().toUpperCase();
        if (!user.phone && data.phone) updateData.phone = data.phone.trim();
        if (!user.branch && data.branch) updateData.branch = data.branch.trim();
        if (!user.year && data.year) updateData.year = Number(data.year);
        if (isAiml && !user.isAiml) updateData.isAiml = true;

        if (Object.keys(updateData).length > 0) {
          user = await db.user.update({
            where: { id: user.id },
            data: updateData,
          });
        }
      }

      return user;
    };

    // ACTION: On-Spot Registration by Admin
    if (action === "ON_SPOT_REGISTRATION") {
      const {
        format,
        teamName,
        markPresent,
        leader,
        members,
        responses,
      } = body;

      if (!leader || (!leader.userId && !leader.email)) {
        return NextResponse.json(
          { error: "Participant name and valid email are required." },
          { status: 400 }
        );
      }

      // 1. Resolve leader user
      const leaderUser = await resolveOrCreateUser(leader);

      // Check if leader already registered
      const existingLeaderReg = await db.eventRegistration.findFirst({
        where: {
          userId: leaderUser.id,
          team: { eventId: id },
        },
      });
      if (existingLeaderReg) {
        return NextResponse.json(
          { error: `Student "${leaderUser.displayName || leaderUser.name || leaderUser.email}" is already registered for this event.` },
          { status: 400 }
        );
      }

      // 2. Resolve additional members (if team)
      const isTeam = (format === "TEAM") || (event.type === "TEAM");
      const memberUsers: { user: any; responses: any }[] = [];

      // Applicable custom fields for teammates
      const teammateFields = (event.customFields || []).filter((cf: any) => {
        if (cf.fieldType === "DISPLAY_IMAGE") return false;
        if (cf.registrationMode === "SOLO") return false;
        if (cf.targetRole === "LEADER_ONLY") return false;
        return true;
      });

      if (isTeam && Array.isArray(members) && members.length > 0) {
        for (const m of members) {
          if (!m.email && !m.userId && !m.name) continue;
          const mUser = await resolveOrCreateUser(m);
          if (mUser.id === leaderUser.id) {
            return NextResponse.json(
              { error: "Leader cannot be added twice as a team member." },
              { status: 400 }
            );
          }
          if (memberUsers.some((item) => item.user.id === mUser.id)) {
            return NextResponse.json(
              { error: `Duplicate student "${mUser.name || mUser.email}" in team roster.` },
              { status: 400 }
            );
          }

          const existingMemberReg = await db.eventRegistration.findFirst({
            where: {
              userId: mUser.id,
              team: { eventId: id },
            },
          });
          if (existingMemberReg) {
            return NextResponse.json(
              { error: `Student "${mUser.name || mUser.email}" is already registered for this event.` },
              { status: 400 }
            );
          }

          const mResponses = m.responses || {};

          // Validate required custom fields for this teammate
          for (const field of teammateFields) {
            const val = mResponses[field.id];
            if (field.isRequired && (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0))) {
              return NextResponse.json(
                { error: `Required field "${field.label}" is missing for team member "${mUser.displayName || mUser.name || mUser.email}".` },
                { status: 400 }
              );
            }

            if (field.fieldType === "NUMBER" && val !== undefined && val !== null && val !== "") {
              const numVal = Number(val);
              if (isNaN(numVal)) {
                return NextResponse.json(
                  { error: `Field "${field.label}" for member "${mUser.displayName || mUser.name || mUser.email}" must be a valid number.` },
                  { status: 400 }
                );
              }
            }
          }

          memberUsers.push({ user: mUser, responses: mResponses });
        }
      }

      const totalSize = 1 + memberUsers.length;
      if (isTeam && event.maxTeamSize && totalSize > event.maxTeamSize) {
        return NextResponse.json(
          { error: `Team size (${totalSize}) exceeds maximum allowed (${event.maxTeamSize}).` },
          { status: 400 }
        );
      }

      if (event.requireAiml) {
        if (!leaderUser.isAiml) {
          return NextResponse.json(
            { error: `Participant "${leaderUser.displayName || leaderUser.name || leaderUser.email}" is not an AIML student. This event is restricted to AIML students only.` },
            { status: 400 }
          );
        }
        for (const item of memberUsers) {
          if (!item.user.isAiml) {
            return NextResponse.json(
              { error: `Team member "${item.user.displayName || item.user.name || item.user.email}" is not an AIML student. This event is restricted to AIML students only.` },
              { status: 400 }
            );
          }
        }
      }

      const isPresent = markPresent !== false;
      const teamCode = (format === "SOLO" || event.type === "SOLO") ? null : await generateUniqueTeamCode();
      const assignedName = (format === "SOLO" || event.type === "SOLO")
        ? null
        : teamName?.trim() || `${leaderUser.displayName || leaderUser.name || "Student"}'s Team`;

      const team = await db.team.create({
        data: {
          eventId: id,
          name: assignedName,
          leaderId: leaderUser.id,
          teamCode,
          status: "CONFIRMED",
          isConfirmed: true,
          attended: isPresent,
          customFieldResponses: responses ?? undefined,
        },
      });

      // Create leader registration
      await db.eventRegistration.create({
        data: {
          userId: leaderUser.id,
          teamId: team.id,
          customFieldResponses: {
            ...(responses || {}),
            verified: isPresent,
            verifiedAt: isPresent ? new Date().toISOString() : null,
            onSpot: true,
          },
        },
      });

      // Create member registrations with their individual custom field responses
      for (const { user: mUser, responses: mResponses } of memberUsers) {
        await db.eventRegistration.create({
          data: {
            userId: mUser.id,
            teamId: team.id,
            customFieldResponses: {
              ...(mResponses || {}),
              verified: isPresent,
              verifiedAt: isPresent ? new Date().toISOString() : null,
              onSpot: true,
            },
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "On-spot registration created successfully!",
        teamId: team.id,
        teamCode,
      });
    }

    // ACTION: Add member to an existing team
    if (action === "ADD_MEMBER") {
      const { member, markPresent } = body;
      const targetUserId = userId || member?.userId;
      const targetEmail = member?.email;

      if (!targetUserId && !targetEmail) {
        return NextResponse.json({ error: "Student selection or email is required" }, { status: 400 });
      }

      if (!teamId) {
        return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
      }

      const team = await db.team.findUnique({
        where: { id: teamId },
        include: { registrations: true },
      });
      if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

      if (event.maxTeamSize && team.registrations.length >= event.maxTeamSize) {
        return NextResponse.json(
          { error: `Team is already full (maximum capacity is ${event.maxTeamSize} members)` },
          { status: 400 }
        );
      }

      const user = await resolveOrCreateUser(member || { userId: targetUserId, email: targetEmail });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      // Check if user is already in this team
      if (team.registrations.some((r) => r.userId === user.id)) {
        return NextResponse.json(
          { error: `Student "${user.displayName || user.name || user.email}" is already a member of this team.` },
          { status: 400 }
        );
      }

      // Check if user is already registered in another team for this event
      const existingReg = await db.eventRegistration.findFirst({
        where: {
          userId: user.id,
          team: { eventId: id },
        },
        include: { team: true },
      });
      if (existingReg) {
        return NextResponse.json(
          { error: `Student "${user.displayName || user.name || user.email}" is already registered in this event (Team: "${existingReg.team?.name || existingReg.team?.teamCode || "Another Team"}").` },
          { status: 400 }
        );
      }

      // Check AIML requirement if event requires AIML
      if (event.requireAiml && !user.isAiml) {
        return NextResponse.json(
          { error: `Student "${user.displayName || user.name || user.email}" is not an AIML student. This event is restricted to AIML students only.` },
          { status: 400 }
        );
      }

      // Applicable custom fields for teammates
      const teammateFields = (event.customFields || []).filter((cf: any) => {
        if (cf.fieldType === "DISPLAY_IMAGE") return false;
        if (cf.registrationMode === "SOLO") return false;
        if (cf.targetRole === "LEADER_ONLY") return false;
        return true;
      });

      const memberResponses = responses || member?.responses || {};

      // Validate required custom fields for this teammate
      for (const field of teammateFields) {
        const val = memberResponses[field.id];
        if (field.isRequired && (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0))) {
          return NextResponse.json(
            { error: `Required question "${field.label}" is missing for member "${user.displayName || user.name || user.email}".` },
            { status: 400 }
          );
        }

        if (field.fieldType === "NUMBER" && val !== undefined && val !== null && val !== "") {
          const numVal = Number(val);
          if (isNaN(numVal)) {
            return NextResponse.json(
              { error: `Field "${field.label}" must be a valid number.` },
              { status: 400 }
            );
          }
        }
      }

      const isPresent = markPresent !== undefined ? !!markPresent : !!team.attended;

      const newRegistration = await db.eventRegistration.create({
        data: {
          userId: user.id,
          teamId,
          customFieldResponses: {
            ...(memberResponses || {}),
            verified: isPresent,
            verifiedAt: isPresent ? new Date().toISOString() : null,
            onSpot: true,
          },
        },
        include: {
          user: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Member added to team successfully",
        registration: newRegistration,
      });
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

// Update attendance / verification status
export async function PATCH(
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
    const { teamId, attended, userId, status, isConfirmed } = body;

    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    const team = await db.team.findFirst({
      where: { id: teamId, eventId: id },
      include: { registrations: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Update Team Roster Confirmation status (CONFIRMED / PENDING)
    if (status !== undefined || isConfirmed !== undefined) {
      const newStatus = status || (isConfirmed ? "CONFIRMED" : "PENDING");
      const confirmedBool = newStatus === "CONFIRMED";
      const updatedTeam = await db.team.update({
        where: { id: teamId },
        data: {
          status: newStatus,
          isConfirmed: confirmedBool,
        },
      });

      return NextResponse.json({
        success: true,
        status: updatedTeam.status,
        isConfirmed: updatedTeam.isConfirmed,
        teamId,
      });
    }

    // Individual member verification
    if (userId) {
      const reg = team.registrations.find((r) => r.userId === userId);
      if (!reg) {
        return NextResponse.json({ error: "Participant not found in team" }, { status: 404 });
      }

      const existingResp = (reg.customFieldResponses as Record<string, any>) || {};
      const newMemberVerified = attended !== undefined ? !!attended : !existingResp.verified;

      await db.eventRegistration.update({
        where: { id: reg.id },
        data: {
          customFieldResponses: {
            ...existingResp,
            verified: newMemberVerified,
            verifiedAt: newMemberVerified ? new Date().toISOString() : null,
          },
        },
      });

      // Update team.attended if at least one member is verified
      const updatedRegs = await db.eventRegistration.findMany({
        where: { teamId },
      });
      const anyMemberVerified = updatedRegs.some(
        (r) => ((r.customFieldResponses as any)?.verified === true)
      );

      const updatedTeam = await db.team.update({
        where: { id: teamId },
        data: { attended: anyMemberVerified },
      });

      return NextResponse.json({
        success: true,
        memberVerified: newMemberVerified,
        teamAttended: updatedTeam.attended,
        teamId,
      });
    }

    // Team-level toggle / set
    const newAttended = attended !== undefined ? !!attended : !team.attended;

    const updatedTeam = await db.team.update({
      where: { id: teamId },
      data: { attended: newAttended },
    });

    // Also update all member registrations
    for (const r of team.registrations) {
      const existingResp = (r.customFieldResponses as Record<string, any>) || {};
      await db.eventRegistration.update({
        where: { id: r.id },
        data: {
          customFieldResponses: {
            ...existingResp,
            verified: newAttended,
            verifiedAt: newAttended ? new Date().toISOString() : null,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      attended: updatedTeam.attended,
      teamId,
    });
  } catch (error: any) {
    console.error("[ADMIN_REGISTRATION_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update verification: " + error.message },
      { status: 500 }
    );
  }
}
