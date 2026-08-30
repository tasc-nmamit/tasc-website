"use client";

import { useState, useMemo } from "react";
import { Event } from "@/lib/types/Event";
import { EventIndexRow } from "@/components/events/EventCard";

interface EventsViewProps {
  initialEvents: Event[];
}

export function EventsView({ initialEvents }: EventsViewProps) {
  // Compute academic year ranges dynamically
  const yearRangesWithEvents = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    // Academic year starts in July (month index 6)
    const maxStartYear = currentMonth >= 6 ? currentYear : currentYear - 1;

    const ranges = [];
    for (let y = maxStartYear; y >= 2021; y--) {
      const start = y;
      const end = y + 1;

      const events = initialEvents.filter((e) => {
        const d = new Date(e.date);
        const m = d.getMonth();
        const yr = d.getFullYear();
        if (yr === start && m >= 6) return true;
        if (yr === end && m < 6) return true;
        return false;
      });

      if (events.length > 0) {
        ranges.push({
          start,
          end,
          label: `${start}–${String(end).slice(-2)}`,
          fullLabel: `${start} — ${end}`,
          events,
        });
      }
    }
    return ranges;
  }, [initialEvents]);

  // Default to index 0 (latest academic year containing events)
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);

  const activeRange = yearRangesWithEvents[selectedYearIndex] || yearRangesWithEvents[0];
  const activeEvents = activeRange ? activeRange.events : [];
  const totalEventCount = initialEvents.length;

  return (
    <div className="flex flex-col min-h-screen w-full pt-20 md:pt-24 pb-20 px-4 md:px-12 lg:px-20 max-w-6xl mx-auto text-foreground font-valley">
      {/* 1. COMPACT HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-brand/20">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-valley tracking-tight text-foreground">
            EVENTS
          </h1>
          <p className="text-muted-foreground font-valley text-xs md:text-sm mt-1">
            Explore what&apos;s happening at TASC.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-card/60 border border-brand/20 text-xs font-mono-tech text-muted-foreground shrink-0 w-fit">
          <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
          <span>{totalEventCount} TOTAL EVENTS</span>
        </div>
      </div>

      {/* 2. STICKY SEGMENTED YEAR NAVIGATION */}
      {yearRangesWithEvents.length > 0 && (
        <div className="sticky top-16 z-20 backdrop-blur-md bg-background/85 py-3 border-b border-brand/15 mb-6">
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-1">
            {yearRangesWithEvents.map((range, idx) => {
              const isActive = idx === selectedYearIndex;
              return (
                <button
                  key={`${range.start}-${range.end}`}
                  onClick={() => setSelectedYearIndex(idx)}
                  className={`relative px-4 py-1.5 text-xs md:text-sm font-valley font-semibold transition-all duration-300 whitespace-nowrap outline-none ${
                    isActive
                      ? "text-brand-accent font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>Academic Year {range.label}</span>
                    <span
                      className={`text-[10px] font-mono-tech px-1.5 py-0.2 rounded ${
                        isActive
                          ? "bg-brand-accent/20 text-brand-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {range.events.length}
                    </span>
                  </span>

                  {/* Active Segment Underline Accent */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ACTIVE YEAR + EVENT COUNT BAR */}
      <div className="flex items-center justify-between py-2 text-xs font-mono-tech text-muted-foreground tracking-wider mb-2">
        <span className="text-foreground/90 font-bold font-valley">
          {activeRange ? activeRange.fullLabel : "ALL EVENTS"}
        </span>
        <span>
          {String(activeEvents.length).padStart(2, "0")}{" "}
          {activeEvents.length === 1 ? "EVENT" : "EVENTS"}
        </span>
      </div>

      {/* 4. COMPACT HORIZONTAL EVENT INDEX LIST */}
      {activeEvents.length > 0 ? (
        <div className="w-full border-t border-brand/20 rounded-lg overflow-hidden bg-card/20 shadow-lg">
          {activeEvents.map((event, idx) => (
            <EventIndexRow key={event.id} event={event} index={idx} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card/30 rounded-lg border border-brand/20">
          <p className="text-muted-foreground font-valley text-xs md:text-sm">
            No events recorded for this academic year.
          </p>
        </div>
      )}
    </div>
  );
}
