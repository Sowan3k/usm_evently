import type { GetServerSideProps } from "next";
import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getAuthSession, loginRedirect } from "@/lib/page-auth";
import { formatEventDate } from "@/lib/events";

type CheckinProps = {
  allowed: boolean;
  registration: {
    id: string;
    status: string;
    attendeeName: string;
    eventTitle: string;
    eventDate: string;
    csdPoints: number;
  } | null;
};

export const getServerSideProps: GetServerSideProps<CheckinProps> = async (
  ctx
) => {
  const session = await getAuthSession(ctx);
  if (!session) {
    return {
      redirect: {
        destination: `/register?next=${encodeURIComponent(ctx.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  const regId = ctx.params?.regId as string;
  const reg = await prisma.registration.findUnique({
    where: { id: regId },
    include: { event: true, user: true },
  });

  if (!reg) return { props: { allowed: false, registration: null } };

  const allowed =
    session.user.role === "ADMIN" ||
    reg.event.submittedById === session.user.id;

  return {
    props: {
      allowed,
      registration: {
        id: reg.id,
        status: reg.status,
        attendeeName: reg.user.name,
        eventTitle: reg.event.title,
        eventDate: reg.event.date.toISOString(),
        csdPoints: reg.event.csdPoints,
      },
    },
  };
};

export default function Checkin({ allowed, registration }: CheckinProps) {
  const [status, setStatus] = useState(registration?.status ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const checkIn = async () => {
    if (!registration) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: registration.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error ?? "Check-in failed");
        return;
      }
      setStatus("ATTENDED");
      setMsg(
        data.alreadyCheckedIn
          ? "Already checked in."
          : `Checked in! ${data.pointsAwarded} MyCSD points awarded.`
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="aurora-bg relative min-h-screen flex flex-col">
      <Header />
      <main className="relative z-10 flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl glass-strong border border-white/10 p-8 text-center shadow-glass-lg">
          {!registration ? (
            <p className="text-white/70">Ticket not found.</p>
          ) : !allowed ? (
            <p className="text-white/70">
              You don&apos;t have permission to check in this ticket. Only the
              event organizer or an admin can.
            </p>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-white">
                Event Check-in
              </h1>
              <p className="mt-4 text-white/80">{registration.attendeeName}</p>
              <p className="text-sm text-white/60">{registration.eventTitle}</p>
              <p className="text-sm text-white/50">
                {formatEventDate(registration.eventDate)}
              </p>

              <div className="my-6">
                {status === "ATTENDED" ? (
                  <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-300">
                    ✓ Checked in
                  </span>
                ) : (
                  <Button onClick={checkIn} disabled={busy} size="lg">
                    {busy ? "Checking in..." : "Confirm Check-in"}
                  </Button>
                )}
              </div>

              {msg && <p className="text-sm text-brand-cyan">{msg}</p>}
            </>
          )}
          <Link
            href="/home"
            className="mt-6 inline-block text-sm text-white/50 hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
