"use client";

import { EventCard } from "@/components/events/EventCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Event } from "@/lib/types/Event";

interface EventsViewProps {
  initialEvents: Event[];
}

export function EventsView({ initialEvents }: EventsViewProps) {
  // Dynamic logic for academic years (from 2021 to current/next academic year)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  // If we are past July, the current academic year starts this year, otherwise last year
  const maxStartYear = currentMonth >= 6 ? currentYear : currentYear - 1;
  
  const yearRanges = [];
  for (let y = maxStartYear; y >= 2021; y--) {
    yearRanges.push({ start: y, end: y + 1 });
  }

  const isInAcademicYear = (date: Date, start: number, end: number) => {
    const d = new Date(date);
    const month = d.getMonth();
    const year = d.getFullYear();
    if (year === start && month >= 6) return true; // July onwards
    if (year === end && month < 6) return true; // Before July
    return false;
  };

  return (
    <div className="flex flex-col min-h-screen w-full pt-28 px-6 md:px-20 pb-20 bg-transparent text-foreground">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12">All Events</h1>

      <Accordion
        type="multiple"
        defaultValue={["item-0"]}
        className="w-[90%] max-w-7xl mx-auto space-y-4"
      >
        {yearRanges.map((range, index) => {
          const eventsInYear = initialEvents.filter((e) =>
            isInAcademicYear(e.date, range.start, range.end),
          );
          if (eventsInYear.length === 0) return null;

          return (
            <AccordionItem
              key={`${range.start}-${range.end}`}
              value={`item-${index}`}
              className="border border-border/50 bg-background/50 backdrop-blur-md rounded-2xl overflow-hidden"
            >
              <AccordionTrigger className="text-2xl font-bold px-6 py-4 hover:bg-muted/50 transition-colors">
                Academic Year {range.start}-{range.end}
              </AccordionTrigger>
              <AccordionContent className="bg-background/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                  {eventsInYear.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
        {initialEvents.length === 0 && (
          <p className="text-center py-10 text-muted-foreground">
            No events found.
          </p>
        )}
      </Accordion>
    </div>
  );
}
