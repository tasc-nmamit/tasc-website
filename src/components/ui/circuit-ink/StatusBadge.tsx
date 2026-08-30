"use client";

import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  let colorClasses = "border-brand/40 bg-brand/10 text-brand-accent";

  if (normalized.includes("COMPLETED") || normalized.includes("ACTIVE") || normalized.includes("REGISTERED")) {
    colorClasses = "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
  } else if (normalized.includes("ONGOING") || normalized.includes("OPEN")) {
    colorClasses = "border-brand-accent/40 bg-brand-accent/10 text-brand-accent";
  } else if (normalized.includes("UPCOMING") || normalized.includes("DRAFT") || normalized.includes("PENDING")) {
    colorClasses = "border-gold/40 bg-gold/10 text-gold";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono-tech tracking-wider uppercase border ${colorClasses} ${className}`}
    >
      STATUS: {normalized}
    </span>
  );
}
