import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import AdminFormsClient from "./AdminFormsClient";

export default async function AdminFormsPage() {
  await requireAdmin();

  const forms = await db.form.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { responses: true },
      },
    },
  });

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Forms & Voting Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create custom forms, polls, and image voting systems.
          </p>
        </div>

        <AdminFormsClient initialForms={forms} />
      </div>
    </main>
  );
}
