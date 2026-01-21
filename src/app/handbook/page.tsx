"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function HandbookContent() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ?? "1";

  return (
    <div className="flex min-h-screen flex-col pt-4">
      <div className="h-16 w-full" />
      <iframe
        className="grow w-full border-none"
        title="handbook"
        src={`https://heyzine.com/flip-book/d49adcee6e.html#page/${page}`}
      />
    </div>
  );
}

export default function HandbookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 text-center">
          Loading handbook...
        </div>
      }
    >
      <HandbookContent />
    </Suspense>
  );
}
