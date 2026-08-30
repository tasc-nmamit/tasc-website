"use client";

import React from "react";
import CircuitTrace from "./CircuitTrace";

interface TechnicalCardProps {
  children: React.ReactNode;
  className?: string;
  circuitAccents?: boolean;
}

export default function TechnicalCard({
  children,
  className = "",
  circuitAccents = true,
}: TechnicalCardProps) {
  return (
    <div
      className={`relative bg-card border border-brand/30 rounded-xl p-6 shadow-xl hover:border-brand-accent/60 transition-all duration-300 ${className}`}
    >
      {circuitAccents && <CircuitTrace corners={true} />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
