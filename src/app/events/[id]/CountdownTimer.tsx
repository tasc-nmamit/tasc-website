"use client";

import { useState, useEffect } from "react";
import { ClockIcon } from "lucide-react";

interface CountdownTimerProps {
  targetDate: Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="bg-brand/10 border border-brand/20 rounded-xl p-4 mt-6">
      <div className="flex items-center gap-2 text-brand-accent mb-3 justify-center">
        <ClockIcon className="w-5 h-5 animate-pulse" />
        <h4 className="font-bold font-space-grotesk text-sm tracking-widest uppercase">Starts In</h4>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-background/50 rounded-lg p-2 backdrop-blur-sm border border-brand/10">
          <div className="text-xl md:text-2xl font-bold font-mono-tech text-foreground">{timeLeft.days}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Days</div>
        </div>
        <div className="bg-background/50 rounded-lg p-2 backdrop-blur-sm border border-brand/10">
          <div className="text-xl md:text-2xl font-bold font-mono-tech text-foreground">{timeLeft.hours.toString().padStart(2, '0')}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Hours</div>
        </div>
        <div className="bg-background/50 rounded-lg p-2 backdrop-blur-sm border border-brand/10">
          <div className="text-xl md:text-2xl font-bold font-mono-tech text-foreground">{timeLeft.minutes.toString().padStart(2, '0')}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Mins</div>
        </div>
        <div className="bg-background/50 rounded-lg p-2 backdrop-blur-sm border border-brand/10">
          <div className="text-xl md:text-2xl font-bold font-mono-tech text-brand-accent">{timeLeft.seconds.toString().padStart(2, '0')}</div>
          <div className="text-[10px] text-brand-accent/80 uppercase">Secs</div>
        </div>
      </div>
    </div>
  );
}
