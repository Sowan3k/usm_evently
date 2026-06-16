import type { Event } from "@prisma/client";

export type SerializedEvent = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  startTime: string | null;
  endTime: string | null;
  location: string;
  campus: string;
  school: string | null;
  organizer: string | null;
  openToPublic: boolean;
  dressCode: string | null;
  culturalNotes: string | null;
  emergencyContact: string;
  imageUrl: string | null;
  posterUrl: string | null;
  category: string | null;
  capacity: number | null;
  price: number;
  csdPoints: number;
  useExternalPayment: boolean;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  tngNumber: string | null;
  paymentInstructions: string | null;
  paymentQrUrl: string | null;
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
    campus: event.campus,
    school: event.school,
    organizer: event.organizer,
    openToPublic: event.openToPublic,
    dressCode: event.dressCode,
    culturalNotes: event.culturalNotes,
    emergencyContact: event.emergencyContact,
    imageUrl: event.imageUrl,
    posterUrl: event.posterUrl,
    category: event.category,
    capacity: event.capacity,
    price: event.price,
    csdPoints: event.csdPoints,
    useExternalPayment: event.useExternalPayment,
    bankName: event.bankName,
    bankAccountName: event.bankAccountName,
    bankAccountNumber: event.bankAccountNumber,
    tngNumber: event.tngNumber,
    paymentInstructions: event.paymentInstructions,
    paymentQrUrl: event.paymentQrUrl,
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
