import type { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import QrImage from "../components/QrImage";
import { prisma } from "@/lib/prisma";
import { getAuthSession, loginRedirect } from "@/lib/page-auth";
import { formatEventDate } from "@/lib/events";

type Ticket = {
  id: string;
  status: string;
  eventId: string;
  title: string;
  date: string;
  location: string;
  campus: string;
  startTime: string | null;
  csdPoints: number;
};

type TicketsProps = { tickets: Ticket[] };

export const getServerSideProps: GetServerSideProps<TicketsProps> = async (
  ctx
) => {
  const session = await getAuthSession(ctx);
  if (!session) return loginRedirect;

  const regs = await prisma.registration.findMany({
    where: { userId: session.user.id, status: { not: "CANCELLED" } },
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });

  return {
    props: {
      tickets: regs.map((r) => ({
        id: r.id,
        status: r.status,
        eventId: r.eventId,
        title: r.event.title,
        date: r.event.date.toISOString(),
        location: r.event.location,
        campus: r.event.campus,
        startTime: r.event.startTime,
        csdPoints: r.event.csdPoints,
      })),
    },
  };
};

function TicketCard({ ticket }: { ticket: Ticket }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const attended = ticket.status === "ATTENDED";

  return (
    <div className="flex flex-col gap-5 rounded-3xl glass-strong border border-white/10 p-6 sm:flex-row sm:items-center">
      <div className="shrink-0 self-center">
        <QrImage value={`${origin}/checkin/${ticket.id}`} />
      </div>
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              attended
                ? "bg-green-500/20 text-green-300"
                : "bg-brand-cyan/20 text-brand-cyan"
            }`}
          >
            {attended ? "✓ Attended" : "Registered"}
          </span>
          {ticket.csdPoints > 0 && (
            <span className="rounded-full bg-brand-gold/15 px-2.5 py-1 text-xs font-semibold text-brand-gold">
              ★ {ticket.csdPoints} MyCSD
            </span>
          )}
        </div>
        <Link href={`/events/${ticket.eventId}`}>
          <h3 className="font-display text-xl font-bold text-white hover:gradient-text">
            {ticket.title}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-white/60">
          {formatEventDate(ticket.date)}
          {ticket.startTime ? ` · ${ticket.startTime}` : ""}
        </p>
        <p className="text-sm text-white/50">
          {ticket.location} · {ticket.campus}
        </p>
        <p className="mt-3 text-xs text-white/40">
          Show this QR code at the event entrance for check-in.
        </p>
      </div>
    </div>
  );
}

export default function Tickets({ tickets }: TicketsProps) {
  return (
    <div className="aurora-bg relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-brand-violet/25 blur-3xl animate-float" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto flex-grow px-4 sm:px-6 py-12">
          <h1 className="mb-8 font-display text-4xl font-bold text-white">
            My <span className="gradient-text">Tickets</span>
          </h1>
          {tickets.length === 0 ? (
            <div className="rounded-2xl glass p-10 text-center text-white/60">
              You haven&apos;t registered for any events yet.{" "}
              <Link href="/home" className="text-brand-cyan hover:underline">
                Browse events
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl">
              {tickets.map((t) => (
                <TicketCard key={t.id} ticket={t} />
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
