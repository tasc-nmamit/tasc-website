"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";

function HandbookContent() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ?? "1";

  return (
    <main className="min-h-dvh pt-28 pb-16 px-4 relative bg-background overflow-hidden">
      {/* Background Ambience Layer */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-blueprint-grid opacity-35 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <TechnicalLabel variant="gold" className="mb-2">
            Academic Resources • Student Guidebook
          </TechnicalLabel>

          <h1 className="text-3xl md:text-5xl font-bold font-space-grotesk text-foreground">
            Student <span className="text-gold">Guidebook & Rules</span>
          </h1>

          <p className="text-sm md:text-base text-muted-foreground font-space-grotesk max-w-2xl mx-auto">
            Official department handbook, academic regulations, event guidelines, and committee policies.
          </p>
        </div>

        {/* Flipbook Glass Container */}
        <div className="relative rounded-3xl border border-brand/30 bg-card/90 backdrop-blur-xl shadow-2xl p-2 sm:p-3 overflow-hidden">
          <CircuitTrace corners={true} />
          <div className="relative z-10 w-full rounded-2xl overflow-hidden bg-background/50 border border-brand/10">
            <iframe
              className="w-full h-[72vh] min-h-[460px] sm:min-h-[550px] border-none bg-background"
              title="Student Handbook"
              src={`https://heyzine.com/flip-book/d49adcee6e.html#page/${page}`}
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function HandbookPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh pt-28 flex items-center justify-center bg-background bg-blueprint-grid">
          <div className="font-mono-tech text-sm text-muted-foreground animate-pulse">
            LOADING_DIGITAL_HANDBOOK...
          </div>
        </main>
      }
    >
      <HandbookContent />
    </Suspense>
  );
}
