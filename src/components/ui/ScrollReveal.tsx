"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variant?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scaleUp";
  delay?: number;
  duration?: number;
  threshold?: number;
}

export default function ScrollReveal({
  children,
  className,
  variant = "fadeUp",
  delay = 0,
  duration = 700,
  threshold = 0.1,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [threshold]);

  const variants = {
    fadeUp: "opacity-0 translate-y-12",
    fadeIn: "opacity-0",
    slideLeft: "opacity-0 translate-x-12",
    slideRight: "opacity-0 -translate-x-12",
    scaleUp: "opacity-0 scale-95",
  };

  const visibleState = {
    fadeUp: "opacity-100 translate-y-0",
    fadeIn: "opacity-100",
    slideLeft: "opacity-100 translate-x-0",
    slideRight: "opacity-100 translate-x-0",
    scaleUp: "opacity-100 scale-100",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all",
        isVisible ? visibleState[variant] : variants[variant],
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", // smooth ease-out
      }}
    >
      {children}
    </div>
  );
}
