"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";

function HandbookContent() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ?? "1";

  return (
    <div className="flex min-h-screen flex-col pt-24 pb-6 px-4 max-w-7xl mx-auto bg-blueprint-grid">
      <div className="mb-4 text-center">

        <h1 className="text-2xl md:text-4xl font-bold font-space-grotesk text-foreground">
          Student <span className="text-gold">Guidebook & Rules</span>
        </h1>
      </div>

      <div className="grow w-full rounded-xl overflow-hidden border border-brand/30 shadow-2xl bg-card">
        <iframe
          className="w-full h-full min-h-[75vh] border-none"
          title="handbook"
          src={`https://heyzine.com/flip-book/d49adcee6e.html#page/${page}`}
        />
      </div>
    </div>
  );
}

export default function HandbookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-28 text-center font-mono-tech text-muted-foreground">
          LOADING_DIGITAL_HANDBOOK...
        </div>
      }
    >
      <HandbookContent />
    </Suspense>
  );
}
