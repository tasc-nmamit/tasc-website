"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  deadline: Date | string;
  variant?: "default" | "red" | "amber" | "emerald";
  expiredLabel?: string;
  onExpire?: () => void;
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

export default function CountdownTimer({
  deadline,
  variant = "red",
  expiredLabel = "Sprint Concluded",
  onExpire,
}: CountdownTimerProps) {
  const targetDate = new Date(deadline);
  const [timeLeft, setTimeLeft] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    const update = () => {
      const remaining = calculateTimeRemaining(targetDate);
      setTimeLeft(remaining);
      if (remaining.isExpired && onExpire) {
        onExpire();
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-1.5 py-1 text-muted-foreground">
        <div className="h-9 w-32 bg-muted/40 dark:bg-white/10 animate-pulse rounded-md" />
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-2 border border-border/70 dark:border-white/15 bg-muted/40 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted-foreground rounded-lg">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
        {expiredLabel}
      </div>
    );
  }

  const units = [
    { label: "DAYS", value: String(timeLeft.days).padStart(2, "0") },
    { label: "HRS", value: String(timeLeft.hours).padStart(2, "0") },
    { label: "MIN", value: String(timeLeft.minutes).padStart(2, "0") },
    { label: "SEC", value: String(timeLeft.seconds).padStart(2, "0") },
  ];

  const numberColor = {
    red: "text-red-500 dark:text-red-400",
    amber: "text-amber-500 dark:text-amber-400",
    emerald: "text-emerald-500 dark:text-emerald-400",
    default: "text-foreground dark:text-white",
  }[variant] || "text-foreground dark:text-white";

  const colonColor = {
    red: "text-red-500/60 dark:text-red-400/60",
    amber: "text-amber-500/60 dark:text-amber-400/60",
    emerald: "text-emerald-500/60 dark:text-emerald-400/60",
    default: "text-muted-foreground/50",
  }[variant] || "text-muted-foreground/50";

  return (
    <div className="flex flex-nowrap items-center gap-1 sm:gap-2 select-none">
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-1 sm:gap-2">
          <div className="flex flex-col items-center justify-center bg-card dark:bg-black/75 border border-border/80 dark:border-white/15 px-2 sm:px-3 py-1 min-w-[42px] sm:min-w-[50px] rounded-lg shadow-sm">
            <span className={`font-mono-tech text-base sm:text-xl font-bold tracking-tight tabular-nums ${numberColor}`}>
              {unit.value}
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-muted-foreground dark:text-slate-400">
              {unit.label}
            </span>
          </div>
          {index < units.length - 1 && (
            <span className={`font-mono-tech text-xs sm:text-sm font-bold -mt-2.5 ${colonColor}`}>
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
