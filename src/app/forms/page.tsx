import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-guards";
import TerminalAccordionStream, { FormItem } from "@/components/forms/TerminalAccordionStream";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";

export const dynamic = "force-dynamic";

export default async function FormsListPage() {
  const session = await getSession();

  // Fetch all published forms
  const formsData = await db.form.findMany({
    where: { published: true },
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
    <main className="min-h-dvh px-4 pt-28 pb-20 relative bg-transparent text-slate-100">
      <div className="relative z-10 mx-auto max-w-4xl space-y-10">

        {/* Header Section */}
        <div className="border border-white/20 bg-black/75 backdrop-blur-md p-6 sm:p-8 rounded-none space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-300 rounded-none">
              <span>COMMUNITY PORTAL</span>
            </div>


          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight font-valley">
              Forms & Polls
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-valley">
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
