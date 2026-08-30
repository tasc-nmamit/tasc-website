"use client";

import React from "react";

interface BlueprintGridProps {
  className?: string;
  children?: React.ReactNode;
}

export default function BlueprintGrid({ className = "", children }: BlueprintGridProps) {
  return (
    <div className={`relative bg-blueprint-grid ${className}`}>
      {children}
    </div>
  );
}
