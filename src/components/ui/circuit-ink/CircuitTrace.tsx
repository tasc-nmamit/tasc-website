"use client";

import React from "react";

interface CircuitTraceProps {
  className?: string;
  corners?: boolean;
}

export default function CircuitTrace({ className = "", corners = true }: CircuitTraceProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 z-10 ${className}`}>
      {/* Structural Thin Line Border */}
      <div className="absolute inset-0 border border-brand/30 rounded-xl" />

      {corners && (
        <>
          {/* Top-Left Corner Node */}
          <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-brand border border-brand-accent" />
          <div className="absolute top-0 left-0 w-3 h-px bg-brand-accent" />
          <div className="absolute top-0 left-0 w-px h-3 bg-brand-accent" />

          {/* Top-Right Corner Node */}
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand border border-brand-accent" />
          <div className="absolute top-0 right-0 w-3 h-px bg-brand-accent" />
          <div className="absolute top-0 right-0 w-px h-3 bg-brand-accent" />

          {/* Bottom-Left Corner Node */}
          <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-brand border border-brand-accent" />
          <div className="absolute bottom-0 left-0 w-3 h-px bg-brand-accent" />
          <div className="absolute bottom-0 left-0 w-px h-3 bg-brand-accent" />

          {/* Bottom-Right Corner Node */}
          <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-brand border border-brand-accent" />
          <div className="absolute bottom-0 right-0 w-3 h-px bg-brand-accent" />
          <div className="absolute bottom-0 right-0 w-px h-3 bg-brand-accent" />
        </>
      )}
    </div>
  );
}
