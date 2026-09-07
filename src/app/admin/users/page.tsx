import { requireOwner } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import UserRoleManager from "./UserRoleManager";
import Link from "next/link";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";
import { ArrowLeft } from "lucide-react";

export default async function AdminUsersPage() {
  await requireOwner();

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      displayName: true,
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
    <main className="min-h-dvh px-4 pt-28 pb-16 bg-background bg-blueprint-grid relative">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-5xl relative z-10">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>[ RETURN_TO_ADMIN_CONSOLE ]</span>
          </Link>

          <TechnicalLabel variant="gold" className="mb-3">
            [ MODULE_02 // USER_DIRECTORY ]
          </TechnicalLabel>

          <h1 className="text-3xl md:text-5xl font-bold font-space-grotesk text-foreground">
            User <span className="text-gold">Management</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground font-space-grotesk">
            Manage student directories, grant administrative privileges, and monitor onboarding statuses.
          </p>
        </div>

        <UserRoleManager users={users as any} />
      </div>
    </main>
  );
}
