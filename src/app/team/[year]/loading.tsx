export default function TeamLoading() {
  return (
    <main className="min-h-dvh bg-background bg-blueprint-grid relative overflow-x-hidden">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/10 via-brand/5 to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col min-h-screen w-full pt-20 md:pt-24 pb-20 px-4 md:px-12 lg:px-20 max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-muted/50 rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted/30 rounded animate-pulse mt-3" />
        </div>

        {/* Year tabs skeleton */}
        <div className="flex gap-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-24 bg-muted/40 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Member cards grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-brand/20 bg-card/40 p-3 space-y-3"
            >
              <div className="w-full aspect-square bg-muted/30 rounded-lg animate-pulse" />
              <div className="h-4 w-3/4 bg-muted/40 rounded animate-pulse mx-auto" />
              <div className="h-3 w-1/2 bg-muted/30 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
