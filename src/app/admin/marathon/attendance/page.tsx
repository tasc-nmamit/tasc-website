import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { getBatchForUser } from "@/lib/marathon-batches";
import AttendanceClient from "./AttendanceClient";

export default async function AdminMarathonAttendancePage() {
  await requireAdmin();

  // Fetch all scheduled marathon classes with attendance and student details
  const classes = await db.marathonClass.findMany({
    orderBy: { date: "desc" },
    include: {
      attendance: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              usn: true,
              year: true,
              branch: true,
            },
          },
        },
        orderBy: [
          { batch: "asc" },
          { user: { usn: "asc" } },
          { user: { name: "asc" } },
        ],
      },
    },
  });

  // Fetch all AIML students and tag with resolved batch
  const aimlUsers = await db.user.findMany({
    where: { isAiml: true },
    select: {
      id: true,
      name: true,
      email: true,
      usn: true,
      year: true,
      branch: true,
      marathonTotalScore: true,
    },
    orderBy: [
      { usn: "asc" },
      { name: "asc" },
    ],
  });

  const studentsWithBatch = aimlUsers.map((u) => ({
    ...u,
    batch: getBatchForUser(u),
  }));

  return (
    <AttendanceClient
      initialClasses={JSON.parse(JSON.stringify(classes))}
      students={studentsWithBatch}
    />
  );
}
