"use client";

import React from "react";

interface TechnicalLabelProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "gold" | "muted";
}

export default function TechnicalLabel({
  children,
  className = "",
  variant = "primary",
}: TechnicalLabelProps) {
  const variantStyles = {
    primary: "text-brand-accent border-brand/40 bg-brand/10",
    gold: "text-gold border-gold/40 bg-gold/10 font-bold",
    muted: "text-lavender-muted border-lavender-muted/30 bg-muted/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono-tech tracking-widest uppercase border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
