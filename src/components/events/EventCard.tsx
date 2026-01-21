import { Event } from "@/lib/types/Event";
import Image from "next/image";
import NextLink from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, ClockIcon } from "lucide-react";

interface EventCardProps {
  event: Event;
}

export function EventCard({
  event,
  mode = "card",
}: EventCardProps & { mode?: "card" | "wide" }) {
  if (mode === "wide") {
    return (
      <div className="flex h-full w-full flex-col relative backdrop-blur-xl dark:border border-purple-950 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.01] duration-300 bg-background">
        \{" "}
        <div className="dark:custom-shadow-black bg-muted-light dark:bg-muted-dark m-auto w-full rounded-2xl bg-opacity-10 dark:bg-opacity-30 px-5 py-6 shadow-xl dark:drop-shadow-md md:grid md:grid-cols-5 z-10">
          <div className="self-center md:col-span-2 p-4">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
              <Image
                src={event.image || "/placeholder.png"}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="w-full sm:px-10 h-full md:col-span-3 flex flex-col justify-center">
            <h1 className="mb-5 text-center lg:text-5xl md:text-4xl text-3xl font-bold text-brand dark:text-purple-600">
              {event.title}
            </h1>
            <div className="m-auto lg:text-2xl md:text-xl bg-card dark:bg-opacity-50 bg-opacity-70 rounded-xl md:p-5 p-2 h-full justify-around grid lg:w-[90%] gap-y-4 backdrop-blur-lg w-full">
              <p className="lg:text-xl md:text-lg text-base text-center line-clamp-3">
                {event.brief}
              </p>
              <div className="w-full grid justify-around lg:text-xl md:text-lg text-base">
                <div className="grid grid-cols-5 w-full gap-2">
                  <p className="font-semibold col-span-1">Date</p>
                  <p className="text-center col-span-1">:</p>
                  <p className="col-span-3">
                    {event.date.toLocaleDateString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {event.time && (
                  <div className="grid grid-cols-5 w-full gap-2">
                    <p className="font-semibold col-span-1">Time</p>
                    <p className="text-center col-span-1">:</p>
                    <p className="col-span-3">{event.time}</p>
                  </div>
                )}
                {event.venue && (
                  <div className="grid grid-cols-5 w-full gap-2">
                    <p className="font-semibold col-span-1">Venue</p>
                    <p className="text-center col-span-1">:</p>
                    <p className="col-span-3">{event.venue}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  className="bg-brand hover:scale-105 transition-transform"
                  asChild
                >
                  <NextLink
                    href={`/events/${(event.type || "upcoming").toLowerCase()}/${event.id}`}
                  >
                    View Details
                  </NextLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300 bg-background">
      {/* Same as before but cleaner */}
      <div className="relative w-full aspect-square">
        <Image
          src={event.image || "/placeholder.png"}
          alt={event.title}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-2 text-xl mb-2">
              {event.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {event.date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grow space-y-2">
        {event.time && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClockIcon className="w-4 h-4" />
            <span>{event.time}</span>
          </div>
        )}
        {event.venue && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPinIcon className="w-4 h-4" />
            <span>{event.venue}</span>
          </div>
        )}
        {/* {event.description && (
                     <p className="text-sm text-foreground mt-4 line-clamp-3">
                        {event.description}
                     </p>
                )} */}
      </CardContent>
    </Card>
  );
}
