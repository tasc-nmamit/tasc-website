export default function HomeLoading() {
  return (
    <main className="min-h-dvh overflow-x-hidden relative bg-background">
      {/* Hero skeleton */}
      <section className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden w-full pt-20 pb-12">
        <div className="absolute inset-0 z-0 bg-background/70 pointer-events-none" />
        <div className="absolute inset-0 z-0 bg-blueprint-grid opacity-35 pointer-events-none" />

        <div className="relative z-30 flex flex-col items-center justify-center max-w-5xl w-full text-center px-4">
          <div className="h-16 md:h-20 w-3/4 bg-muted/30 rounded-xl animate-pulse mb-6" />
          <div className="h-5 w-96 max-w-full bg-muted/20 rounded animate-pulse mb-4" />
          <div className="h-5 w-72 max-w-full bg-muted/20 rounded animate-pulse mb-10" />
          <div className="flex gap-4">
            <div className="h-12 w-36 bg-muted/30 rounded-xl animate-pulse" />
            <div className="h-12 w-32 bg-muted/20 rounded-xl animate-pulse" />
          </div>
        </div>
      </section>
    </main>
  );
}
