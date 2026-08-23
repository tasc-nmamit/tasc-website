import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-guards";
import Link from "next/link";
import { ClockIcon, LockIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FormsListPage() {
  const session = await getSession();

  // Fetch all published forms
  const forms = await db.form.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { responses: true }
      }
    }
  });

  const now = new Date();

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-foreground">Forms & Polls</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Participate in club decisions, vote for your favorite designs, and provide feedback through our active forms.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => {
            const isNotStarted = form.startTime && now < form.startTime;
            const isEnded = form.endTime && now > form.endTime;
            const isActive = !isNotStarted && !isEnded;
            
            const aimlRestricted = form.requireAiml && (!session || !session.user.isAiml);

            return (
              <div key={form.id} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-background/80 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-brand/30 hover:shadow-xl">
                <div>
                  <div className="mb-4 flex gap-2">
                    {isActive ? (
                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-500 uppercase tracking-wider">
                        Active
                      </span>
                    ) : isNotStarted ? (
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-500 uppercase tracking-wider">
                        Starting Soon
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Ended
                      </span>
                    )}
                    
                    {form.requireAiml && (
                      <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500 uppercase tracking-wider">
                        <LockIcon className="h-3 w-3" /> AIML Only
                      </span>
                    )}
                  </div>
                  
                  <h2 className="mb-2 text-xl font-bold text-foreground">
                    {form.title}
                  </h2>
                  
                  {form.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {form.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 border-t border-border/50 pt-4">
                  {(form.startTime || form.endTime) && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <ClockIcon className="h-4 w-4 shrink-0" />
                      <span>
                        {isNotStarted ? `Opens ${form.startTime?.toLocaleDateString()}` : 
                         isActive && form.endTime ? `Closes ${form.endTime?.toLocaleDateString()}` : 
                         isEnded ? `Closed ${form.endTime?.toLocaleDateString()}` : ""}
                      </span>
                    </div>
                  )}

                  {!session ? (
                    <Link href="/auth/signin" className="block w-full rounded-xl bg-muted py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-accent">
                      Sign in to Participate
                    </Link>
                  ) : aimlRestricted ? (
                    <div className="w-full rounded-xl border border-red-500/20 bg-red-500/5 py-2.5 text-center text-sm font-semibold text-red-500">
                      Restricted to AIML Students
                    </div>
                  ) : !isActive ? (
                    <div className="w-full rounded-xl bg-muted py-2.5 text-center text-sm font-semibold text-muted-foreground">
                      {isNotStarted ? "Not Open Yet" : "Form Closed"}
                    </div>
                  ) : (
                    <Link href={`/forms/${form.id}`} className="block w-full rounded-xl bg-brand py-2.5 text-center text-sm font-semibold text-white shadow-md transition-all hover:bg-brand/90 hover:shadow-brand/25">
                      Open Form
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
          
          {forms.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-xl text-muted-foreground">No active forms available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
