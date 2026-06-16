import type { GetServerSideProps } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getAuthSession, loginRedirect } from "@/lib/page-auth";
import {
  serializeEvent,
  formatEventDate,
  type SerializedEvent,
} from "@/lib/events";
import { downloadICS } from "@/lib/calendar";

type EventDetailProps = {
  event: SerializedEvent;
  isRegistered: boolean;
};

export const getServerSideProps: GetServerSideProps<EventDetailProps> = async (
  ctx
) => {
  const session = await getAuthSession(ctx);
  if (!session) return loginRedirect;

  const id = ctx.params?.id as string;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return { notFound: true };
  }

  const registration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId: id } },
  });

  return {
    props: {
      event: serializeEvent(event),
      isRegistered: registration?.status === "REGISTERED",
    },
  };
};

export default function EventDetails({
  event,
  isRegistered: initialRegistered,
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
    ? "from-purple-800 to-gold"
    : "from-green-500 to-blue-500";

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-8 bg-gradient-to-br from-gray-200 to-gray-300">
        <div className="container mx-auto max-w-3xl">
          <Card className="rounded-lg shadow-xl overflow-hidden">
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
              <p className="text-md text-gray-600 mb-4">
                <strong>Price:</strong>{" "}
                {event.price > 0 ? `RM ${event.price.toFixed(2)}` : "Free"}
              </p>
              <p className="text-gray-700 mb-6">{event.description}</p>

              {message && (
                <p className="mb-4 text-sm font-medium text-usmPurple">
                  {message}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                {!event.isPast &&
                  (isRegistered ? (
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
