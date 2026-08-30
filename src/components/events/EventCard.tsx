"use client";

import { useState } from "react";
import { Event } from "@/lib/types/Event";
import Image from "next/image";
import NextLink from "next/link";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";

interface EventIndexRowProps {
  event: Event;
  index: number;
}

export function EventIndexRow({ event, index }: EventIndexRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedIndex = String(index + 1).padStart(2, "0");

  const eventDate = new Date(event.date);
  const dayNum = eventDate.getDate();
  const monthStr = eventDate.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const dateDisplay = `${dayNum} ${monthStr}`;

  const normStatus = (event.status || "UPCOMING").toUpperCase();
  const isCompleted = normStatus.includes("COMPLETED") || normStatus.includes("PAST");
  const isLive = normStatus.includes("LIVE") || normStatus.includes("ONGOING");

  const handleRowClick = (e: React.MouseEvent) => {
    // If user clicked an anchor tag or button inside row, don't trigger row toggle
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) {
      return;
    }
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group relative w-full border-b border-brand/15 bg-card/30 hover:bg-card/75 transition-all duration-300 cursor-pointer font-valley ${
        isExpanded ? "bg-card/85 border-brand-accent/40" : ""
      }`}
    >
      {/* Left subtle accent bar on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="px-4 md:px-6 py-3 md:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
        {/* Left section: Index Number, Thumbnail Image, Title & Type */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          {/* Numbered Index */}
          <span className="font-mono-tech text-xs md:text-sm font-bold text-muted-foreground/40 group-hover:text-brand-accent transition-colors duration-300 w-6 shrink-0 text-center">
            {formattedIndex}
          </span>

          {/* Small Photo Thumbnail */}
          <div className="relative w-14 h-10 md:w-20 md:h-13 rounded-md overflow-hidden shrink-0 border border-brand/20 bg-black/40 shadow-sm transition-all duration-300 group-hover:scale-[1.03] group-hover:border-brand-accent/40">
            <Image
              src={event.image || "/placeholder.png"}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-300"
            />
          </div>

          {/* Event Title & Type */}
          <div className="min-w-0 flex-1">
            <NextLink
              href={`/events/${event.id}`}
              className="inline-block outline-none focus:underline"
            >
              <h3 className="font-valley font-semibold text-sm md:text-base text-foreground group-hover:text-brand-accent group-hover:translate-x-1 transition-all duration-300 truncate">
                {event.title}
              </h3>
            </NextLink>

            {event.type && (
              <p className="text-[10px] md:text-[11px] font-mono-tech text-muted-foreground/80 uppercase tracking-wider line-clamp-1 mt-0.5">
                {event.type}
              </p>
            )}
          </div>
        </div>

        {/* Right section: Date & Time, Status Indicator, Action Arrow */}
        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-7 shrink-0 border-t md:border-t-0 border-brand/10 pt-2 md:pt-0">
          {/* Date & Time */}
          <div className="text-left md:text-right font-mono-tech text-xs text-muted-foreground space-y-0.5">
            <div className="text-foreground/90 font-medium flex items-center gap-1.5 md:justify-end">
              <CalendarIcon className="w-3 h-3 text-brand-accent" />
              <span>{dateDisplay}</span>
            </div>
            {event.time && (
              <div className="text-[11px] text-muted-foreground/70 flex items-center gap-1.5 md:justify-end">
                <ClockIcon className="w-3 h-3 text-muted-foreground/50" />
                <span>{event.time}</span>
              </div>
            )}
          </div>

          {/* Minimal Status Indicator */}
          <div className="shrink-0 min-w-[95px] text-right">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-tech text-emerald-400">
                <span className="text-emerald-400">✓</span> COMPLETED
              </span>
            ) : isLive ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-tech text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> LIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-tech text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> UPCOMING
              </span>
            )}
          </div>

          {/* Action & Toggle Controls */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <NextLink
              href={`/events/${event.id}`}
              className="p-1 text-muted-foreground hover:text-brand-accent transition-colors group-hover:translate-x-1"
              title="View Event Details"
            >
              <ArrowRightIcon className="w-4 h-4" />
            </NextLink>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              className="p-1 text-muted-foreground/60 hover:text-foreground transition-colors"
              aria-label="Toggle Details"
            >
              {isExpanded ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Inline Detail Drawer */}
      {isExpanded && (
        <div className="px-4 md:px-6 pb-4 pt-1 border-t border-brand/10 bg-background/50 transition-all duration-300 space-y-3 font-valley">
          <div className="ml-0 md:ml-10 max-w-3xl space-y-2.5">
            {(event.brief || event.description) && (
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-valley">
                {event.brief || event.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono-tech text-muted-foreground pt-1">
              {event.venue && (
                <div className="flex items-center gap-1.5">
                  <MapPinIcon className="w-3.5 h-3.5 text-brand-accent" />
                  <span>VENUE: {event.venue}</span>
                </div>
              )}
              <span>NODE_ID: EVT_{event.id.slice(-4).toUpperCase()}</span>
            </div>

            <div className="pt-2">
              <NextLink
                href={`/events/${event.id}`}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded bg-brand-accent hover:bg-purple-600 text-white font-valley text-xs font-bold tracking-wider transition-colors shadow-sm"
              >
                <span>VIEW EVENT →</span>
              </NextLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function EventCard({
  event,
  index = 0,
}: {
  event: Event;
  index?: number;
  mode?: string;
}) {
  return <EventIndexRow event={event} index={index} />;
}
