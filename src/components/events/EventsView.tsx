"use client";

import { useRouter } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Event } from "@/lib/types/Event";

interface EventsViewProps {
  initialEvents: Event[];
  type: string;
}

export function EventsView({ initialEvents, type }: EventsViewProps) {
  const router = useRouter();
  const isUpcoming = type === "upcoming";

  // Legacy logic for academic years
  const yearRanges = [
    { start: 2024, end: 2025 },
    { start: 2023, end: 2024 },
    { start: 2022, end: 2023 },
    { start: 2021, end: 2022 },
  ];

  const isInAcademicYear = (date: Date, start: number, end: number) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    if (year === start && month >= 6) return true; // July onwards
    if (year === end && month < 6) return true; // Before July
    return false;
  };

  return (
    <div className="flex flex-col min-h-screen w-full pt-20 px-6 md:px-20 pb-20 bg-transparent text-foreground">
      <div className="flex w-full justify-center space-x-8 py-10 font-bold md:space-x-16">
        <Button
          variant="ghost"
          className={cn(
            "text-xl md:text-2xl hover:bg-transparent hover:underline underline-offset-4",
            !isUpcoming && "underline decoration-primary",
          )}
          onClick={() => router.push("/events/previous")}
        >
          Previous Events
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "text-xl md:text-2xl hover:bg-transparent hover:underline underline-offset-4",
            isUpcoming && "underline decoration-primary",
          )}
          onClick={() => router.push("/events/upcoming")}
        >
          Upcoming Events
        </Button>
      </div>

      {isUpcoming ? (
        <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto">
          {initialEvents.map((event) => (
            <EventCard key={event.id} event={event} mode="wide" />
          ))}
          {initialEvents.length === 0 && (
            <p className="text-center w-full text-muted-foreground text-lg">
              No upcoming events scheduled.
            </p>
          )}
        </div>
      ) : (
        <Accordion
          type="single"
          collapsible
          defaultValue="item-0"
          className="w-[90%] mx-auto"
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
                className="border-b-2 border-slate-200 dark:border-slate-800"
              >
                <AccordionTrigger className="text-2xl font-semibold px-4">
                  {range.start} - {range.end}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 px-4">
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
              No previous events found.
            </p>
          )}
        </Accordion>
      )}
    </div>
  );
}
