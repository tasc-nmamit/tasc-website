import { requireOwner } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import UserRoleManager from "./UserRoleManager";

export default async function AdminUsersPage() {
  await requireOwner();

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isAiml: true,
      year: true,
      branch: true,
      onboardingComplete: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            User Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage user roles — promote or demote admins. Only owners can access this page.
          </p>
        </div>

        <UserRoleManager users={users} />
      </div>
    </main>
  );
}
