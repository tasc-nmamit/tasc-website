/**
 * Timezone utilities for TASC Marathon and Events (IST / Asia/Kolkata: UTC+05:30)
 *
 * Ensures dates entered in HTML datetime-local inputs (which are timezone-naive)
 * are parsed as IST on any server environment (including Vercel running in UTC),
 * and correctly formatted back to datetime-local values in IST.
 */

/**
 * Parses a contest date string or Date object.
 * If the input is a datetime-local string (e.g. "YYYY-MM-DDTHH:mm") without an explicit timezone offset,
 * it assumes India Standard Time (+05:30) so that Vercel / serverless deployments in UTC
 * do not schedule the contest 5 hours 30 minutes later than intended.
 */
export function parseContestDate(input: string | Date | null | undefined): Date {
  if (!input) return new Date();
  if (input instanceof Date) return input;

  const trimmed = String(input).trim();
  // Match "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss" without offset ('Z', '+', '-')
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(trimmed)) {
    return new Date(`${trimmed}+05:30`);
  }

  return new Date(trimmed);
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
    timeZone: "Asia/Kolkata",
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
