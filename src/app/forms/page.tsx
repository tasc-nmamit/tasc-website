import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-guards";
import TerminalAccordionStream, { FormItem } from "@/components/forms/TerminalAccordionStream";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";

export const dynamic = "force-dynamic";

export default async function FormsListPage() {
  const session = await getSession();

  const isAiml = !!session?.user?.isAiml || session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";

  // Fetch all published forms (do not show AIML exclusive forms to users not in AIML branch)
  const formsData = await db.form.findMany({
    where: {
      published: true,
      ...(isAiml ? {} : { requireAiml: false }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { responses: true },
      },
    },
  });

  const forms: FormItem[] = formsData.map((f) => ({
    id: f.id,
    title: f.title,
    description: f.description,
    startTime: f.startTime,
    endTime: f.endTime,
    requireAiml: f.requireAiml,
    published: f.published,
    createdAt: f.createdAt,
    responsesCount: f._count.responses,
  }));

  const user = session?.user
    ? {
      id: session.user.id,
      isAiml: !!session.user.isAiml,
      role: session.user.role || "USER",
    }
    : null;

  return (
    <main className="min-h-dvh px-4 pt-28 pb-20 relative bg-background bg-blueprint-grid text-foreground overflow-x-hidden">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 via-brand/5 to-transparent pointer-events-none" />
      <div className="relative z-10 mx-auto max-w-4xl space-y-10">

        {/* Header Section */}
        <div className="relative border border-brand/25 bg-card/85 backdrop-blur-xl p-6 sm:p-8 rounded-xl space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TechnicalLabel variant="primary">Community Portal • Forms Hub</TechnicalLabel>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight font-space-grotesk">
              Forms & Polls
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-space-grotesk">
              Participate in department decisions, submit academic forms, and cast your votes.
            </p>
          </div>
        </div>

        {/* Terminal Accordion Stream */}
        <section>
          <TerminalAccordionStream forms={forms} user={user} />
        </section>

      </div>
    </main>
  );
}
