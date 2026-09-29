export default function EventsLoading() {
  return (
    <main className="min-h-dvh bg-background bg-blueprint-grid relative overflow-x-hidden">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 via-brand/5 to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col min-h-screen w-full pt-20 md:pt-24 pb-20 px-4 md:px-12 lg:px-20 max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-brand/20">
          <div>
            <div className="h-9 w-48 bg-muted/60 rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted/40 rounded animate-pulse mt-2" />
          </div>
          <div className="h-8 w-36 bg-muted/40 rounded animate-pulse" />
        </div>

        {/* Year tabs skeleton */}
        <div className="flex gap-3 py-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 bg-muted/40 rounded animate-pulse" />
          ))}
        </div>

        {/* Event rows skeleton */}
        <div className="w-full border-t border-brand/20 rounded-lg overflow-hidden bg-card/20">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="px-4 md:px-6 py-4 flex items-center gap-4 border-b border-brand/15"
            >
              <div className="w-6 h-4 bg-muted/30 rounded animate-pulse" />
              <div className="w-20 h-13 bg-muted/40 rounded-md animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted/50 rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted/30 rounded animate-pulse" />
              </div>
              <div className="h-4 w-20 bg-muted/30 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
