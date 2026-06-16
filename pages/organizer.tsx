import type { GetServerSideProps } from "next";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EventForm from "../components/EventForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getAuthSession, loginRedirect } from "@/lib/page-auth";
import { formatEventDate } from "@/lib/events";

type MyEvent = {
  id: string;
  title: string;
  date: string;
  status: string;
  rejectionReason: string | null;
};

type OrganizerProps = {
  status: string;
  organization: string | null;
  organizerNote: string | null;
  myEvents: MyEvent[];
};

export const getServerSideProps: GetServerSideProps<OrganizerProps> = async (
  ctx
) => {
  const session = await getAuthSession(ctx);
  if (!session) return loginRedirect;
  if (session.user.role === "ADMIN") {
    return { redirect: { destination: "/admin", permanent: false } };
  }

  const [user, myEvents] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizerStatus: true, organization: true, organizerNote: true },
    }),
    prisma.event.findMany({
      where: { submittedById: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        date: true,
        status: true,
        rejectionReason: true,
      },
    }),
  ]);

  return {
    props: {
      status: user?.organizerStatus ?? "NONE",
      organization: user?.organization ?? null,
      organizerNote: user?.organizerNote ?? null,
      myEvents: myEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date.toISOString(),
        status: e.status,
        rejectionReason: e.rejectionReason,
      })),
    },
  };
};

const statusBadge: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function Organizer({
  status,
  organization,
  organizerNote,
  myEvents,
}: OrganizerProps) {
  const router = useRouter();
  const [org, setOrg] = useState(organization ?? "");
  const [note, setNote] = useState(organizerNote ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const refresh = () => router.replace(router.asPath);

  const requestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/organizer/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organization: org, organizerNote: note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }
      refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto p-8 space-y-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">Organizer</h1>

        {(status === "NONE" || status === "REJECTED") && (
          <Card className="p-6 bg-white shadow-lg">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl text-usmPurple">
                Become an event organizer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {status === "REJECTED" && (
                <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                  Your previous request was not approved. You may request again.
                </p>
              )}
              <p className="mb-4 text-sm text-gray-600">
                Request organizer access to submit events for your club, society,
                or department. An admin reviews each request, and your events are
                published after approval.
              </p>
              <form onSubmit={requestAccess} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Club / society / department you represent
                  </label>
                  <Input
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="e.g. USM Tech Society"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Why do you want to organize? (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-usmPurple"
                    placeholder="Tell us about the events you plan to run."
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={busy}>
                  {busy ? "Submitting..." : "Request organizer access"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {status === "PENDING" && (
          <Card className="p-6 bg-white shadow-lg">
            <CardContent className="p-0 text-center">
              <p className="text-lg font-semibold text-gray-900">
                Your organizer request is pending review
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Representing <strong>{organization}</strong>. An admin will
                review it shortly, then you can submit events here.
              </p>
            </CardContent>
          </Card>
        )}

        {status === "APPROVED" && (
          <>
            <Card className="p-6 bg-white shadow-lg">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl text-usmPurple">
                  Submit a new event
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Your submission goes to the admin moderation queue and appears
                  publicly once approved.
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {submitted ? (
                  <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
                    Event submitted for review.{" "}
                    <button
                      className="underline"
                      onClick={() => {
                        setSubmitted(false);
                        refresh();
                      }}
                    >
                      Submit another
                    </button>
                  </div>
                ) : (
                  <EventForm onSaved={() => setSubmitted(true)} />
                )}
              </CardContent>
            </Card>

            <Card className="p-6 bg-white shadow-lg">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl text-usmPurple">
                  My submissions ({myEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {myEvents.length === 0 ? (
                  <p className="text-sm text-gray-500">No events submitted yet.</p>
                ) : (
                  <div className="divide-y">
                    {myEvents.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center justify-between py-3 gap-4"
                      >
                        <div className="min-w-0">
                          <Link href={`/events/${e.id}`}>
                            <p className="font-semibold text-gray-900 truncate hover:text-usmPurple">
                              {e.title}
                            </p>
                          </Link>
                          <p className="text-sm text-gray-500">
                            {formatEventDate(e.date)}
                          </p>
                          {e.status === "REJECTED" && e.rejectionReason && (
                            <p className="text-xs text-red-500">
                              {e.rejectionReason}
                            </p>
                          )}
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-semibold ${
                            statusBadge[e.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {e.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
