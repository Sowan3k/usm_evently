import type { GetServerSideProps } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/page-auth";
import {
  serializeEvent,
  formatEventDate,
  type SerializedEvent,
} from "@/lib/events";
import { downloadICS } from "@/lib/calendar";

type EventDetailProps = {
  event: SerializedEvent;
  isRegistered: boolean;
  isLoggedIn: boolean;
};

// Public: event details are viewable without signing in. Registering still
// requires an account.
export const getServerSideProps: GetServerSideProps<EventDetailProps> = async (
  ctx
) => {
  const session = await getAuthSession(ctx);

  const id = ctx.params?.id as string;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return { notFound: true };
  }

  const registration = session
    ? await prisma.registration.findUnique({
        where: { userId_eventId: { userId: session.user.id, eventId: id } },
      })
    : null;

  return {
    props: {
      event: serializeEvent(event),
      isRegistered: registration?.status === "REGISTERED",
      isLoggedIn: Boolean(session),
    },
  };
};

export default function EventDetails({
  event,
  isRegistered: initialRegistered,
  isLoggedIn,
}: EventDetailProps) {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(initialRegistered);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not register");
        return;
      }
      setIsRegistered(true);
      if (data.requiresPayment) {
        router.push(
          `/payment?eventId=${event.id}&amount=${event.price}&description=${encodeURIComponent(
            event.title
          )}`
        );
        return;
      }
      if (data.externalPayment) {
        setMessage(
          "You're registered! Please pay the organiser directly using the payment details below."
        );
        return;
      }
      setMessage("You're registered! 🎉");
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/registrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      });
      if (res.ok) {
        setIsRegistered(false);
        setMessage("Registration cancelled.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Check out ${event.title} on USM Evently!`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      setMessage("Link copied to clipboard!");
    }
  };

  const headerGradient = event.isPast
    ? "from-ink-700 via-brand-fuchsia to-brand-violet"
    : "from-brand-violet via-brand-indigo to-brand-cyan";

  return (
    <div className="aurora-bg relative min-h-screen flex flex-col">
      <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-brand-violet/25 blur-3xl animate-float" />
      <Header />
      <main className="relative z-10 flex-grow p-4 sm:p-8">
        <div className="container mx-auto max-w-3xl">
          <Card className="rounded-3xl shadow-glass-lg overflow-hidden border-white/40 animate-fade-up">
            <img
              src={event.imageUrl ?? "/event1.jpg"}
              alt={event.title}
              className="w-full h-72 object-cover"
            />
            <CardHeader
              className={`p-6 bg-gradient-to-r ${headerGradient} text-white`}
            >
              <CardTitle className="text-3xl font-bold">
                {event.title}
              </CardTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className="bg-white text-black">
                  {event.isPast ? "Past Event" : "Upcoming Event"}
                </Badge>
                {event.category && (
                  <Badge className="bg-usmPurple text-white">
                    {event.category}
                  </Badge>
                )}
                {event.csdPoints > 0 && (
                  <Badge className="bg-gold text-usmPurple">
                    {event.csdPoints} MyCSD pts
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-md text-gray-600 mb-2">
                <strong>Date:</strong> {formatEventDate(event.date)}
              </p>
              {(event.startTime || event.endTime) && (
                <p className="text-md text-gray-600 mb-2">
                  <strong>Time:</strong> {event.startTime}
                  {event.endTime ? ` - ${event.endTime}` : ""}
                </p>
              )}
              <p className="text-md text-gray-600 mb-2">
                <strong>Location:</strong> {event.location}
              </p>
              <p className="text-md text-gray-600 mb-2">
                <strong>Campus:</strong> {event.campus}
              </p>
              {event.school && (
                <p className="text-md text-gray-600 mb-2">
                  <strong>Organising School:</strong> {event.school}
                </p>
              )}
              {event.organizer && (
                <p className="text-md text-gray-600 mb-2">
                  <strong>Organiser:</strong> {event.organizer}
                </p>
              )}
              <p className="text-md text-gray-600 mb-2">
                <strong>Entry:</strong>{" "}
                {event.price > 0 ? `RM ${event.price.toFixed(2)}` : "Free"} ·{" "}
                {event.openToPublic
                  ? "Open to the public (outsiders welcome)"
                  : "USM students & staff only"}
              </p>
              {event.dressCode && (
                <p className="text-md text-gray-600 mb-2">
                  <strong>Dress code:</strong> {event.dressCode}
                </p>
              )}
              <p className="text-gray-700 my-6">{event.description}</p>

              {event.culturalNotes && (
                <div className="mb-4 rounded-md border-l-4 border-usmPurple bg-purple-50 p-4">
                  <p className="text-sm font-semibold text-usmPurple">
                    Cultural &amp; etiquette notes
                  </p>
                  <p className="text-sm text-gray-700">{event.culturalNotes}</p>
                </div>
              )}

              <div className="mb-6 rounded-md border-l-4 border-red-500 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Emergency helpline
                </p>
                <p className="text-sm text-gray-700">
                  In case of emergency during this event, contact the organiser
                  at{" "}
                  <a
                    href={`tel:${event.emergencyContact.replace(/\s+/g, "")}`}
                    className="font-semibold underline"
                  >
                    {event.emergencyContact}
                  </a>
                  .
                </p>
              </div>

              {event.price > 0 && event.useExternalPayment && (
                <div className="mb-6 rounded-md border-l-4 border-green-600 bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-800">
                    Pay the organiser directly (RM {event.price.toFixed(2)})
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    This event uses the organiser&apos;s own payment method
                    instead of platform checkout.
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {event.bankName && (
                      <li>
                        <strong>Bank:</strong> {event.bankName}
                      </li>
                    )}
                    {event.bankAccountName && (
                      <li>
                        <strong>Account name:</strong> {event.bankAccountName}
                      </li>
                    )}
                    {event.bankAccountNumber && (
                      <li>
                        <strong>Account number:</strong>{" "}
                        {event.bankAccountNumber}
                      </li>
                    )}
                    {event.tngNumber && (
                      <li>
                        <strong>Touch &apos;n Go:</strong> {event.tngNumber}
                      </li>
                    )}
                  </ul>
                  {event.paymentInstructions && (
                    <p className="text-sm text-gray-600 mt-2">
                      {event.paymentInstructions}
                    </p>
                  )}
                  {event.paymentQrUrl && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Scan to pay:</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.paymentQrUrl}
                        alt="Payment QR code"
                        className="h-44 w-44 object-contain rounded border bg-white p-1"
                      />
                    </div>
                  )}
                </div>
              )}

              {event.posterUrl && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Event poster
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.posterUrl}
                    alt={`${event.title} poster`}
                    className="max-h-96 w-auto rounded-lg border shadow"
                  />
                </div>
              )}

              {message && (
                <p className="mb-4 text-sm font-medium text-usmPurple">
                  {message}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                {!event.isPast &&
                  (!isLoggedIn ? (
                    <Link href="/register">
                      <Button variant="default">Log in to register</Button>
                    </Link>
                  ) : isRegistered ? (
                    <Button
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel Registration
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={handleRegister}
                      disabled={loading}
                    >
                      {event.price > 0
                        ? `Register (RM ${event.price.toFixed(2)})`
                        : "Register"}
                    </Button>
                  ))}
                <Button variant="secondary" onClick={() => downloadICS(event)}>
                  Add to Calendar
                </Button>
                <Button variant="ghost" onClick={handleShare}>
                  Share Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
