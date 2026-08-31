import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import RegistrationsClient from "./RegistrationsClient";

export default async function AdminEventRegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await db.event.findUnique({
    where: { id },
  });

  if (!event) return notFound();

  // Fetch all registrations for this event
  const teams = await db.eventTeam.findMany({
    where: { eventId: id },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch all users to allow admin to add them
  const allUsers = await db.user.findMany({
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <RegistrationsClient event={event} teams={teams} allUsers={allUsers} />
    </div>
  );
}
