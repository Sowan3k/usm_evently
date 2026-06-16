import type { Event } from "@prisma/client";

export type SerializedEvent = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  startTime: string | null;
  endTime: string | null;
  location: string;
  imageUrl: string | null;
  category: string | null;
  capacity: number | null;
  price: number;
  csdPoints: number;
  isPast: boolean;
};

/**
 * Converts a Prisma Event (with Date objects) into a plain, JSON-serializable
 * shape suitable for getServerSideProps and the client.
 */
export function serializeEvent(event: Event): SerializedEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date.toISOString(),
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    imageUrl: event.imageUrl,
    category: event.category,
    capacity: event.capacity,
    price: event.price,
    csdPoints: event.csdPoints,
    isPast: event.date.getTime() < Date.now(),
  };
}

/**
 * Formats an ISO date string into a friendly, locale-stable label.
 */
export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
