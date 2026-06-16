import type { SerializedEvent } from "./events";

// Build an ICS timestamp (UTC) like 20260701T090000Z.
function toICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Generates the contents of an .ics calendar file for an event so users can
 * add it to Google/Apple/Outlook calendars.
 */
export function buildICS(event: SerializedEvent): string {
  const start = new Date(event.date);
  // Default to a 2-hour block; this is a simple demo calendar entry.
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//USM Evently//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@usm-evently`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description)}`,
    `LOCATION:${escapeICS(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

/**
 * Triggers a browser download of the event's .ics file.
 */
export function downloadICS(event: SerializedEvent): void {
  const blob = new Blob([buildICS(event)], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
