"use client";

import React from "react";

interface NeuralNodesProps {
  className?: string;
}

export default function NeuralNodes({ className = "" }: NeuralNodesProps) {
  return (
    <svg
      className={`pointer-events-none absolute opacity-25 dark:opacity-20 ${className}`}
      width="300"
      height="200"
      viewBox="0 0 300 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Structural Connecting Edges */}
      <line x1="30" y1="40" x2="110" y2="90" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="110" y1="90" x2="210" y2="50" stroke="#5B35A0" strokeWidth="1" />
      <line x1="110" y1="90" x2="180" y2="150" stroke="#8B5CF6" strokeWidth="1" />
      <line x1="210" y1="50" x2="270" y2="120" stroke="#5B35A0" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="180" y1="150" x2="270" y2="120" stroke="#8B5CF6" strokeWidth="1" />
      <line x1="30" y1="40" x2="80" y2="160" stroke="#5B35A0" strokeWidth="1" />
      <line x1="80" y1="160" x2="180" y2="150" stroke="#8B5CF6" strokeWidth="1" />

      {/* Nodes */}
      <circle cx="30" cy="40" r="4" fill="#B8A4E3" stroke="#5B35A0" strokeWidth="2" />
      <circle cx="110" cy="90" r="5" fill="#8B5CF6" stroke="#5B35A0" strokeWidth="2" />
      <circle cx="210" cy="50" r="4" fill="#B8A4E3" stroke="#5B35A0" strokeWidth="2" />
      <circle cx="180" cy="150" r="5" fill="#C9A15A" stroke="#5B35A0" strokeWidth="2" />
      <circle cx="270" cy="120" r="4" fill="#B8A4E3" stroke="#5B35A0" strokeWidth="2" />
      <circle cx="80" cy="160" r="3" fill="#8B5CF6" stroke="#5B35A0" strokeWidth="1.5" />
    </svg>
  );
}
