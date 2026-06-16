import type { GetServerSideProps } from "next";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { prisma } from "@/lib/prisma";
import { serializeEvent, formatEventDate, type SerializedEvent } from "@/lib/events";

type HomeProps = {
  upcoming: SerializedEvent[];
  past: SerializedEvent[];
};

// Public: anyone can browse upcoming & past events without signing in.
export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: { date: { gte: now } },
      orderBy: { date: "asc" },
    }),
    prisma.event.findMany({
      where: { date: { lt: now } },
      orderBy: { date: "desc" },
    }),
  ]);

  return {
    props: {
      upcoming: upcoming.map(serializeEvent),
      past: past.map(serializeEvent),
    },
  };
};

export default function Home({ upcoming, past }: HomeProps) {
  const [currentImage, setCurrentImage] = useState(0);

  // Use real event images for the background slideshow when available.
  const images =
    [...upcoming, ...past].map((e) => e.imageUrl).filter(Boolean).length > 0
      ? ([...upcoming, ...past]
          .map((e) => e.imageUrl)
          .filter(Boolean) as string[])
      : ["/event1.jpg", "/event2.jpg", "/event3.jpg"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative min-h-screen">
      {/* Slideshow Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-lg"
        style={{
          backgroundImage: `url(${images[currentImage]})`,
          transition: "background-image 1s ease-in-out",
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow p-8">
          <div className="container mx-auto space-y-12">
            {/* Upcoming Events */}
            <section id="upcoming-events">
              <h2 className="text-3xl font-bold text-gold mb-6">
                Upcoming Events
              </h2>
              {upcoming.length === 0 ? (
                <p className="text-gray-200">No upcoming events right now.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcoming.map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
                        <img
                          src={event.imageUrl ?? "/event1.jpg"}
                          alt={event.title}
                          className="h-60 w-full object-cover"
                        />
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-usmPurple">
                            {event.title}
                          </h3>
                          <p className="text-md text-gray-500">
                            {formatEventDate(event.date)}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-gold">
                            {event.price > 0
                              ? `RM ${event.price.toFixed(2)}`
                              : "Free"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Past Events */}
            <section id="past-events">
              <h2 className="text-3xl font-bold text-gold mb-6">Past Events</h2>
              {past.length === 0 ? (
                <p className="text-gray-200">No past events yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {past.map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <img
                          src={event.imageUrl ?? "/past1.jpg"}
                          alt={event.title}
                          className="h-40 w-full object-cover"
                        />
                        <div className="p-4 text-center">
                          <h3 className="text-md font-medium text-gray-700">
                            {event.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
