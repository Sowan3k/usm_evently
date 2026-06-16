import type { GetServerSideProps } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EventForm from "../../components/EventForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getAuthSession, loginRedirect, adminRedirect } from "@/lib/page-auth";
import {
  serializeEvent,
  formatEventDate,
  type SerializedEvent,
} from "@/lib/events";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  identityType: string | null;
  identityNumber: string | null;
  organizerStatus: string;
  organization: string | null;
  organizerNote: string | null;
  blocked: boolean;
  blockedReason: string | null;
  createdAt: string;
  registrationCount: number;
};

type AdminBlockedEmail = {
  id: string;
  email: string;
  reason: string | null;
  createdAt: string;
};

type AdminProps = {
  events: SerializedEvent[];
  users: AdminUser[];
  blockedEmails: AdminBlockedEmail[];
};

export const getServerSideProps: GetServerSideProps<AdminProps> = async (
  ctx
) => {
  const session = await getAuthSession(ctx);
  if (!session) return loginRedirect;
  if (session.user.role !== "ADMIN") return adminRedirect;

  const [events, users, blockedEmails] = await Promise.all([
    prisma.event.findMany({ orderBy: { date: "desc" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        identityType: true,
        identityNumber: true,
        organizerStatus: true,
        organization: true,
        organizerNote: true,
        blocked: true,
        blockedReason: true,
        createdAt: true,
        _count: { select: { registrations: true } },
      },
    }),
    prisma.blockedEmail.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return {
    props: {
      events: events.map(serializeEvent),
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        identityType: u.identityType,
        identityNumber: u.identityNumber,
        organizerStatus: u.organizerStatus,
        organization: u.organization,
        organizerNote: u.organizerNote,
        blocked: u.blocked,
        blockedReason: u.blockedReason,
        createdAt: u.createdAt.toISOString(),
        registrationCount: u._count.registrations,
      })),
      blockedEmails: blockedEmails.map((b) => ({
        id: b.id,
        email: b.email,
        reason: b.reason,
        createdAt: b.createdAt.toISOString(),
      })),
    },
  };
};

export default function AdminDashboard({
  events,
  users,
  blockedEmails,
}: AdminProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<SerializedEvent | null>(null);
  const [busy, setBusy] = useState(false);

  const [blockEmail, setBlockEmail] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [modError, setModError] = useState<string | null>(null);
  const [modBusy, setModBusy] = useState(false);

  const refresh = () => router.replace(router.asPath);

  const pendingEvents = events.filter((e) => e.status === "PENDING");
  const organizerRequests = users.filter(
    (u) => u.organizerStatus === "PENDING"
  );

  const startEdit = (event: SerializedEvent) => {
    setEditing(event);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (editing?.id === id) setEditing(null);
        refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const reviewEvent = async (id: string, status: "APPROVED" | "REJECTED") => {
    let rejectionReason = "";
    if (status === "REJECTED") {
      rejectionReason = prompt("Reason for rejection?") ?? "";
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, rejectionReason }),
      });
      if (res.ok) refresh();
    } finally {
      setBusy(false);
    }
  };

  const reviewOrganizer = async (
    userId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/organizers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      if (res.ok) refresh();
    } finally {
      setBusy(false);
    }
  };

  const toggleUserBlock = async (user: AdminUser) => {
    const next = !user.blocked;
    let reason = "";
    if (next) {
      reason = prompt(`Reason for blocking ${user.email}?`) ?? "";
    } else if (!confirm(`Unblock ${user.email}?`)) {
      return;
    }
    setModBusy(true);
    setModError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, blocked: next, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModError(data.error ?? "Action failed");
        return;
      }
      refresh();
    } finally {
      setModBusy(false);
    }
  };

  const handleBlockEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setModBusy(true);
    setModError(null);
    try {
      const res = await fetch("/api/admin/blocked-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: blockEmail, reason: blockReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModError(data.error ?? "Could not block email");
        return;
      }
      setBlockEmail("");
      setBlockReason("");
      refresh();
    } finally {
      setModBusy(false);
    }
  };

  const unblockEmail = async (email: string) => {
    if (!confirm(`Unblock ${email}?`)) return;
    setModBusy(true);
    try {
      const res = await fetch(
        `/api/admin/blocked-emails?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );
      if (res.ok) refresh();
    } finally {
      setModBusy(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Link
            href="/admin/analytics"
            className="rounded-xl bg-gradient-to-r from-brand-violet to-brand-indigo px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5"
          >
            View Analytics
          </Link>
        </div>

        {/* Create / Edit form */}
        <Card className="p-6 bg-white shadow-lg">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl text-usmPurple">
              {editing ? "Edit Event" : "Create New Event"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <EventForm
              key={editing?.id ?? "new"}
              initial={editing}
              onSaved={() => {
                setEditing(null);
                refresh();
              }}
              onCancel={editing ? () => setEditing(null) : undefined}
            />
          </CardContent>
        </Card>

        {/* Pending event approvals */}
        {pendingEvents.length > 0 && (
          <Card
            id="pending-events"
            className="p-6 bg-white shadow-lg border-l-4 border-brand-violet scroll-mt-20"
          >
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl text-usmPurple">
                Pending Event Approvals ({pendingEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {pendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between py-3 gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatEventDate(event.date)} · {event.campus} ·{" "}
                        {event.organizer ?? "organiser"}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        onClick={() => startEdit(event)}
                      >
                        View / Edit
                      </Button>
                      <Button
                        onClick={() => reviewEvent(event.id, "APPROVED")}
                        disabled={busy}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => reviewEvent(event.id, "REJECTED")}
                        disabled={busy}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Organizer requests */}
        {organizerRequests.length > 0 && (
          <Card className="p-6 bg-white shadow-lg border-l-4 border-brand-cyan">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl text-usmPurple">
                Organizer Requests ({organizerRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {organizerRequests.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between py-3 gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {u.name}{" "}
                        <span className="text-xs font-normal text-gray-400">
                          {u.organization}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {u.email}
                      </p>
                      {u.organizerNote && (
                        <p className="text-xs text-gray-400 italic">
                          “{u.organizerNote}”
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        onClick={() => reviewOrganizer(u.id, "APPROVED")}
                        disabled={busy}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => reviewOrganizer(u.id, "REJECTED")}
                        disabled={busy}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event list */}
        <Card className="p-6 bg-white shadow-lg">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl text-usmPurple">
              All Events ({events.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-3 gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {event.title}
                      {event.status !== "APPROVED" && (
                        <span
                          className={`ml-2 rounded px-1.5 py-0.5 text-xs ${
                            event.status === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {event.status}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatEventDate(event.date)} · {event.campus} ·{" "}
                      {event.price > 0 ? `RM ${event.price.toFixed(2)}` : "Free"}
                      {event.isPast ? " · Past" : " · Upcoming"}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="secondary" onClick={() => startEdit(event)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(event.id)}
                      disabled={busy}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User moderation */}
        <Card id="moderation" className="p-6 bg-white shadow-lg scroll-mt-20">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl text-usmPurple">
              Users &amp; Moderation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            {modError && <p className="text-sm text-red-600">{modError}</p>}

            <form
              onSubmit={handleBlockEmail}
              className="flex flex-col sm:flex-row gap-3 sm:items-end"
            >
              <div className="flex-1">
                <label className="block text-sm text-gray-700 font-medium">
                  Block an email address
                </label>
                <Input
                  type="email"
                  value={blockEmail}
                  onChange={(e) => setBlockEmail(e.target.value)}
                  placeholder="person@gmail.com"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-700 font-medium">
                  Reason (optional)
                </label>
                <Input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. spam / abuse"
                />
              </div>
              <Button type="submit" variant="destructive" disabled={modBusy}>
                Block email
              </Button>
            </form>

            {blockedEmails.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Blocked emails ({blockedEmails.length})
                </p>
                <div className="divide-y">
                  {blockedEmails.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between py-2 gap-4"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800 truncate">
                          {b.email}
                        </p>
                        {b.reason && (
                          <p className="text-xs text-gray-400">{b.reason}</p>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => unblockEmail(b.email)}
                        disabled={modBusy}
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Registered users ({users.length})
              </p>
              <div className="divide-y">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between py-3 gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {u.name}{" "}
                        <span className="text-xs font-normal text-gray-400">
                          ({u.role})
                        </span>
                        {u.organizerStatus === "APPROVED" && (
                          <span className="ml-2 rounded bg-cyan-100 px-1.5 py-0.5 text-xs text-cyan-700">
                            Organizer
                          </span>
                        )}
                        {u.blocked && (
                          <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                            Blocked
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {u.email} · {u.registrationCount} registrations
                      </p>
                      {u.identityNumber && (
                        <p className="text-xs text-gray-400 truncate">
                          ID ({u.identityType}): {u.identityNumber}
                        </p>
                      )}
                    </div>
                    <Button
                      variant={u.blocked ? "secondary" : "destructive"}
                      onClick={() => toggleUserBlock(u)}
                      disabled={modBusy || u.role === "ADMIN"}
                    >
                      {u.blocked ? "Unblock" : "Block"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
