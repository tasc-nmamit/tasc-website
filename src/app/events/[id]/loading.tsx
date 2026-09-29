export default function EventDetailLoading() {
  return (
    <main className="min-h-dvh pt-28 pb-20 relative bg-background bg-blueprint-grid overflow-x-hidden">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 via-brand/5 to-transparent pointer-events-none" />
      <div className="mx-auto max-w-5xl px-4 relative z-10 space-y-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-5 w-48 bg-muted/40 rounded animate-pulse" />
          <span className="h-px flex-1 bg-brand/20" />
        </div>

        {/* Hero image skeleton */}
        <div className="w-full h-[380px] sm:h-[420px] md:h-[440px] rounded-xl bg-muted/30 animate-pulse border border-brand/20" />

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-brand/30 bg-card/80 p-6 md:p-8 space-y-4">
              <div className="h-7 w-48 bg-muted/50 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-muted/30 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-brand/30 bg-card/80 p-6 space-y-5">
              <div className="h-6 w-40 bg-muted/50 rounded animate-pulse" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3.5 items-start">
                  <div className="w-9 h-9 bg-muted/40 rounded-lg animate-pulse shrink-0" />
                  <div className="space-y-1 flex-1">
                    <div className="h-3 w-12 bg-muted/30 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-muted/40 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
