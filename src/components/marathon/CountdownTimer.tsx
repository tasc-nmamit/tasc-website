"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  deadline: Date | string;
  variant?: "default" | "red";
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(targetDate: Date): TimeRemaining {
  const total = targetDate.getTime() - new Date().getTime();
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, isExpired: false };
}

export default function CountdownTimer({ deadline, variant = "red" }: CountdownTimerProps) {
  const targetDate = new Date(deadline);
  const [timeLeft, setTimeLeft] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    setTimeLeft(calculateTimeRemaining(targetDate));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 py-1 text-muted-foreground">
        <div className="h-10 w-24 bg-white/10 animate-pulse" />
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-2 border border-red-500/40 bg-red-500/10 px-3.5 py-1.5 text-xs font-semibold text-red-400">
        <span className="h-2 w-2 bg-red-500" />
        Sprint Concluded
      </div>
    );
  }

  const units = [
    { label: "DAYS", value: String(timeLeft.days).padStart(2, "0") },
    { label: "HRS", value: String(timeLeft.hours).padStart(2, "0") },
    { label: "MIN", value: String(timeLeft.minutes).padStart(2, "0") },
    { label: "SEC", value: String(timeLeft.seconds).padStart(2, "0") },
  ];

  const numberColor = variant === "red" ? "text-red-400" : "text-white";

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-center bg-black/60 border border-white/15 px-3 py-1.5 min-w-[52px]">
            <span className={`font-sans text-xl sm:text-2xl font-bold tracking-tight ${numberColor}`}>
              {unit.value}
            </span>
            <span className="text-[9px] font-bold tracking-widest text-slate-400">
              {unit.label}
            </span>
          </div>
          {index < units.length - 1 && (
            <span className="font-sans text-base font-bold text-red-400/60 -mt-3">
              :
            </span>
          )}
        </div>
      ))}
      <span className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
        remaining
      </span>
    </div>
  );
}
