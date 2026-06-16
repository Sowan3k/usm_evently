import type { GetServerSideProps } from "next";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { prisma } from "@/lib/prisma";
import {
  serializeEvent,
  formatEventDate,
  type SerializedEvent,
} from "@/lib/events";

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

function UpcomingTile({ event, i }: { event: SerializedEvent; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/events/${event.id}`} className="block h-full">
        <article className="group relative h-full overflow-hidden rounded-3xl glass-strong border border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-glow">
          <div className="relative h-52 overflow-hidden">
            <img
              src={event.imageUrl ?? "/event1.jpg"}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/20 to-transparent" />
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/15">
                {event.price > 0 ? `RM ${event.price.toFixed(2)}` : "Free"}
              </span>
              {event.category && (
                <span className="rounded-full bg-brand-violet/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  {event.category}
                </span>
              )}
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-display text-xl font-bold text-white transition-colors duration-300 group-hover:gradient-text">
              {event.title}
            </h3>
            <p className="mt-2 text-sm text-white/60">
              {formatEventDate(event.date)}
            </p>
            <p className="mt-1 text-xs text-white/40 truncate">{event.campus}</p>
            <div className="mt-4 flex items-center justify-between">
              {event.csdPoints > 0 ? (
                <span className="rounded-full bg-brand-gold/15 px-2.5 py-1 text-xs font-semibold text-brand-gold">
                  ★ {event.csdPoints} MyCSD
                </span>
              ) : (
                <span />
              )}
              <span className="translate-x-2 text-sm font-semibold text-brand-cyan opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                View details →
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function PastTile({ event, i }: { event: SerializedEvent; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: i * 0.05, duration: 0.5 }}
    >
      <Link href={`/events/${event.id}`} className="block h-full">
        <article className="group relative h-40 overflow-hidden rounded-2xl border border-white/10">
          <img
            src={event.imageUrl ?? "/past1.jpg"}
            alt={event.title}
            className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-semibold text-white/90 group-hover:text-white">
              {event.title}
            </h3>
            <p className="text-[11px] text-white/50">
              {formatEventDate(event.date)}
            </p>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

export default function Home({ upcoming, past }: HomeProps) {
  return (
    <div className="aurora-bg relative min-h-screen overflow-hidden">
      {/* Floating ambient orbs */}
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-brand-violet/30 blur-3xl animate-float" />
      <div
        className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-brand-cyan/20 blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-brand-fuchsia/20 blur-3xl animate-float"
        style={{ animationDelay: "4s" }}
      />
      {/* Faint grid overlay */}
      <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        <main className="flex-grow">
          {/* Hero */}
          <section className="container mx-auto px-4 sm:px-6 pt-16 pb-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/80">
                <span className="h-2 w-2 rounded-full bg-brand-cyan animate-pulse-glow" />
                Live campus events at Universiti Sains Malaysia
              </span>
              <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
                Discover what&apos;s{" "}
                <span className="gradient-text">happening</span> at USM
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-white/60 sm:text-lg">
                Orientation, career fairs, expos and more — browse, register,
                and earn MyCSD points, all in one place.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <a
                  href="#upcoming-events"
                  className="rounded-2xl bg-gradient-to-r from-brand-violet to-brand-indigo px-7 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:brightness-110"
                >
                  Explore events
                </a>
                <Link
                  href="/register"
                  className="rounded-2xl glass px-7 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Join USM Evently
                </Link>
              </div>
            </motion.div>
          </section>

          <div className="container mx-auto space-y-16 px-4 sm:px-6 pb-20">
            {/* Upcoming Events */}
            <section id="upcoming-events" className="scroll-mt-24">
              <div className="mb-8 flex items-end justify-between">
                <h2 className="font-display text-3xl font-bold text-white">
                  Upcoming <span className="gradient-text">Events</span>
                </h2>
                <span className="text-sm text-white/40">
                  {upcoming.length} event{upcoming.length === 1 ? "" : "s"}
                </span>
              </div>
              {upcoming.length === 0 ? (
                <p className="rounded-2xl glass p-8 text-center text-white/60">
                  No upcoming events right now — check back soon.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((event, i) => (
                    <UpcomingTile key={event.id} event={event} i={i} />
                  ))}
                </div>
              )}
            </section>

            {/* Past Events */}
            <section id="past-events">
              <h2 className="mb-8 font-display text-3xl font-bold text-white">
                Past <span className="gradient-text">Events</span>
              </h2>
              {past.length === 0 ? (
                <p className="rounded-2xl glass p-8 text-center text-white/60">
                  No past events yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {past.map((event, i) => (
                    <PastTile key={event.id} event={event} i={i} />
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
