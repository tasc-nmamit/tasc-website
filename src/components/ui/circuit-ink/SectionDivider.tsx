"use client";

import React from "react";

interface SectionDividerProps {
  label?: string;
  className?: string;
}

export default function SectionDivider({ label, className = "" }: SectionDividerProps) {
  return (
    <div className={`flex items-center gap-3 my-8 ${className}`}>
      <span className="h-px bg-brand/30 flex-1"></span>
      {label && (
        <span className="font-mono-tech text-xs tracking-widest text-brand-accent uppercase px-3 py-1 bg-card border border-brand/30 rounded">
          {label}
        </span>
      )}
      <span className="h-px bg-brand/30 flex-1"></span>
    </div>
  );
}
