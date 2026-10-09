/**
 * Timezone utilities for TASC Marathon and Events (IST / Asia/Kolkata: UTC+05:30)
 *
 * Ensures dates entered in HTML datetime-local / date inputs (which are timezone-naive)
 * are parsed as IST on any server environment (including Vercel running in UTC),
 * and correctly formatted back to datetime-local and date input values in IST.
 */

export const IST_TIMEZONE = "Asia/Kolkata";
export const IST_OFFSET = "+05:30";

/**
 * Formats a Date object or ISO string into "YYYY-MM-DD" in Asia/Kolkata time,
 * suitable for populating <input type="date" />.
 */
export function formatDateForDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d); // "YYYY-MM-DD"
}

/**
 * Formats a Date object or ISO string into "YYYY-MM-DDTHH:mm" in Asia/Kolkata time,
 * suitable for populating <input type="datetime-local" />.
 */
export function formatDateForDateTimeLocal(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(d);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "00";
  return `${getPart("year")}-${getPart("month")}-${getPart("day")}T${getPart("hour")}:${getPart("minute")}`;
}

/**
 * Parses a contest/event date string or Date object.
 * If the input is a date string or datetime-local string without an explicit timezone offset,
 * it assumes India Standard Time (+05:30) so that Vercel / serverless deployments in UTC
 * do not schedule or interpret the event/contest 5 hours 30 minutes later than intended.
 */
export function parseContestDate(input: string | Date | null | undefined): Date {
  if (!input) return new Date();
  if (input instanceof Date) return input;

  const trimmed = String(input).trim();
  if (!trimmed) return new Date();

  // Match "YYYY-MM-DD" (date only) -> treat as midnight in IST
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00+05:30`);
  }

  // Match "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss" without offset ('Z', '+', '-')
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(trimmed)) {
    return new Date(`${trimmed}+05:30`);
  }

  return new Date(trimmed);
}

/**
 * Combines an event date (e.g. "YYYY-MM-DD" or Date) and optional time (e.g. "10:00" or "10:00 AM")
 * into a definitive Date object in Asia/Kolkata time (UTC+05:30).
 * Prevents Vercel/serverless UTC environments from running setHours() and shifting the time by 5.5 hours.
 */
export function combineDateAndTimeIST(
  date: Date | string | null | undefined,
  time?: string | null | undefined
): Date {
  if (!date) return new Date();

  let datePart: string;
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date.trim())) {
    datePart = date.trim().slice(0, 10);
  } else {
    datePart = formatDateForDateInput(date);
  }

  let hours = 0;
  let minutes = 0;

  if (time && typeof time === "string") {
    const match = time.trim().match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const meridiem = match[3]?.toUpperCase();
      if (meridiem === "PM" && hours < 12) hours += 12;
      if (meridiem === "AM" && hours === 12) hours = 0;
    }
  }

  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");

  return new Date(`${datePart}T${paddedHours}:${paddedMinutes}:00+05:30`);
}

/**
 * Standard calculation for event time states in IST.
 * Crucially keeps registrations available when the event is ongoing (isLive).
 */
export function getEventDateTimes(event: {
  date: Date | string;
  time?: string | null;
  endDate?: Date | string | null;
  registrationStartTime?: Date | string | null;
  status?: string | null;
}) {
  const startDateTime = combineDateAndTimeIST(event.date, event.time);

  let endDateTime: Date;
  if (event.endDate) {
    endDateTime = parseContestDate(event.endDate);
  } else {
    // If no explicit end time, default to 3 hours after start time
    endDateTime = new Date(startDateTime.getTime() + 3 * 60 * 60 * 1000);
  }

  const now = new Date();
  const isUpcoming = now < startDateTime;
  const isLive = now >= startDateTime && now <= endDateTime;
  const isPast = event.status === "COMPLETED" || now > endDateTime;

  const registrationStartTime = event.registrationStartTime
    ? parseContestDate(event.registrationStartTime)
    : null;
  const isScheduled = registrationStartTime ? now < registrationStartTime : false;

  return {
    startDateTime,
    endDateTime,
    isUpcoming,
    isLive,
    isPast,
    isScheduled,
  };
}
