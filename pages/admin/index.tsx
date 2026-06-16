import type { GetServerSideProps } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
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
import { USM_CAMPUSES, USM_SCHOOLS } from "@/lib/constants";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  identityType: string | null;
  identityNumber: string | null;
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

type FormState = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  campus: string;
  school: string;
  organizer: string;
  dressCode: string;
  culturalNotes: string;
  emergencyContact: string;
  imageUrl: string;
  posterUrl: string;
  category: string;
  capacity: string;
  price: string;
  csdPoints: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  tngNumber: string;
  paymentInstructions: string;
  paymentQrUrl: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  campus: "",
  school: "",
  organizer: "",
  dressCode: "",
  culturalNotes: "",
  emergencyContact: "",
  imageUrl: "",
  posterUrl: "",
  category: "",
  capacity: "",
  price: "0",
  csdPoints: "0",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  tngNumber: "",
  paymentInstructions: "",
  paymentQrUrl: "",
};

const MAX_POSTER_BYTES = 5 * 1024 * 1024; // 5 MB

export default function AdminDashboard({
  events,
  users,
  blockedEmails,
}: AdminProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [openToPublic, setOpenToPublic] = useState(false);
  const [useExternalPayment, setUseExternalPayment] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [posterError, setPosterError] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Moderation panel state
  const [blockEmail, setBlockEmail] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [modError, setModError] = useState<string | null>(null);
  const [modBusy, setModBusy] = useState(false);

  const refresh = () => router.replace(router.asPath);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Reads an image file into a data URL on the given form field, validating
  // type and size. Used for both the poster and the payment QR code.
  const readImageInto = (
    field: "posterUrl" | "paymentQrUrl",
    setErr: (m: string | null) => void
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setErr(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setErr("Image must be a JPG or PNG.");
      return;
    }
    if (file.size > MAX_POSTER_BYTES) {
      setErr("Image is too large (max 5 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setForm((prev) => ({ ...prev, [field]: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const handlePoster = readImageInto("posterUrl", setPosterError);
  const handleQr = readImageInto("paymentQrUrl", setQrError);

  const startEdit = (event: SerializedEvent) => {
    setEditingId(event.id);
    setError(null);
    setPosterError(null);
    setQrError(null);
    setOpenToPublic(event.openToPublic);
    setUseExternalPayment(event.useExternalPayment);
    setAgreed(true); // already published, agreement previously accepted
    setForm({
      title: event.title,
      description: event.description,
      date: event.date.slice(0, 10),
      startTime: event.startTime ?? "",
      endTime: event.endTime ?? "",
      location: event.location,
      campus: event.campus,
      school: event.school ?? "",
      organizer: event.organizer ?? "",
      dressCode: event.dressCode ?? "",
      culturalNotes: event.culturalNotes ?? "",
      emergencyContact: event.emergencyContact,
      imageUrl: event.imageUrl ?? "",
      posterUrl: event.posterUrl ?? "",
      category: event.category ?? "",
      capacity: event.capacity?.toString() ?? "",
      price: event.price.toString(),
      csdPoints: event.csdPoints.toString(),
      bankName: event.bankName ?? "",
      bankAccountName: event.bankAccountName ?? "",
      bankAccountNumber: event.bankAccountNumber ?? "",
      tngNumber: event.tngNumber ?? "",
      paymentInstructions: event.paymentInstructions ?? "",
      paymentQrUrl: event.paymentQrUrl ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpenToPublic(false);
    setUseExternalPayment(false);
    setAgreed(false);
    setError(null);
    setPosterError(null);
    setQrError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please accept the Organizer Agreement before publishing.");
      return;
    }
    setBusy(true);
    setError(null);

    const payload = {
      ...form,
      openToPublic,
      useExternalPayment,
      capacity: form.capacity === "" ? undefined : form.capacity,
      agreedToTerms: true,
    };

    try {
      const res = await fetch(
        editingId ? `/api/events/${editingId}` : "/api/events",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      resetForm();
      refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (editingId === id) resetForm();
        refresh();
      }
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

  const field = (
    label: string,
    name: keyof FormState,
    type = "text",
    placeholder = "",
    required = false
  ) => (
    <div>
      <label className="block text-sm text-gray-700 font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <Input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto p-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

        {/* Create / Edit form */}
        <Card className="p-6 bg-white shadow-lg">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl text-usmPurple">
              {editingId ? "Edit Event" : "Create New Event"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basics */}
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Event details
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {field("Title", "title", "text", "", true)}
                  {field("Category", "category", "text", "e.g. Career")}
                  {field("Date", "date", "date", "", true)}
                  {field("Location / Venue", "location", "text", "", true)}
                  {field("Start Time", "startTime", "text", "09:00 AM")}
                  {field("End Time", "endTime", "text", "05:00 PM")}
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium">
                    Description<span className="text-red-500"> *</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    required
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-usmPurple"
                  />
                </div>
              </fieldset>

              {/* Where at USM */}
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  USM organiser &amp; campus
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 font-medium">
                      USM Campus<span className="text-red-500"> *</span>
                    </label>
                    <select
                      name="campus"
                      value={form.campus}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-usmPurple"
                    >
                      <option value="">Select a campus…</option>
                      {USM_CAMPUSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium">
                      Organising School / Faculty
                    </label>
                    <input
                      name="school"
                      list="usm-schools"
                      value={form.school}
                      onChange={handleChange}
                      placeholder="e.g. School of Computer Sciences"
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-usmPurple"
                    />
                    <datalist id="usm-schools">
                      {USM_SCHOOLS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>
                  {field(
                    "Organiser (club / society / dept.)",
                    "organizer",
                    "text",
                    "e.g. USM Tech Society"
                  )}
                </div>
              </fieldset>

              {/* Access, safety & conduct */}
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Access, safety &amp; conduct
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {field("Price in RM (0 = free for all)", "price", "number")}
                  {field("Capacity", "capacity", "number", "optional")}
                  {field("MyCSD Points", "csdPoints", "number")}
                  {field(
                    "Emergency Helpline (organiser)",
                    "emergencyContact",
                    "text",
                    "+60 1X-XXX XXXX",
                    true
                  )}
                  {field("Dress Code", "dressCode", "text", "e.g. Smart casual, no shorts")}
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={openToPublic}
                    onChange={(e) => setOpenToPublic(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Outsiders / non-USM visitors are allowed
                </label>
                <div>
                  <label className="block text-sm text-gray-700 font-medium">
                    Cultural / etiquette notes visitors must observe
                  </label>
                  <textarea
                    name="culturalNotes"
                    value={form.culturalNotes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g. Modest attire required; remove shoes before entering the prayer hall."
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-usmPurple"
                  />
                </div>
              </fieldset>

              {/* Media */}
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Media
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {field("Banner Image URL", "imageUrl", "text", "/event1.jpg")}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium">
                      Event Poster (JPG/PNG, max 5 MB)
                    </label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handlePoster}
                      className="w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-usmPurple file:px-3 file:py-1.5 file:text-white"
                    />
                    {posterError && (
                      <p className="text-sm text-red-600 mt-1">{posterError}</p>
                    )}
                    {form.posterUrl && (
                      <div className="mt-2 flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.posterUrl}
                          alt="Poster preview"
                          className="h-20 w-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((p) => ({ ...p, posterUrl: "" }))
                          }
                          className="text-sm text-red-600 underline"
                        >
                          Remove poster
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </fieldset>

              {/* Alternative payment (optional) */}
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Payment method
                </legend>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={useExternalPayment}
                    onChange={(e) => setUseExternalPayment(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Use my own payment details instead of platform checkout
                  (optional)
                </label>
                {useExternalPayment && (
                  <div className="space-y-4 rounded-md border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">
                      Provide at least one way for attendees to pay you (bank,
                      Touch &apos;n Go, or a QR code). Shown on the event page
                      for paid events.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {field("Bank name", "bankName", "text", "e.g. Maybank")}
                      {field("Account holder name", "bankAccountName")}
                      {field("Account number", "bankAccountNumber")}
                      {field(
                        "Touch 'n Go (eWallet no./ID)",
                        "tngNumber",
                        "text",
                        "+60..."
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 font-medium">
                        Payment instructions
                      </label>
                      <textarea
                        name="paymentInstructions"
                        value={form.paymentInstructions}
                        onChange={handleChange}
                        rows={2}
                        placeholder="e.g. Transfer and send the receipt to the organiser on WhatsApp."
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-usmPurple"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 font-medium">
                        Payment QR code (JPG/PNG, max 5 MB)
                      </label>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleQr}
                        className="w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-usmPurple file:px-3 file:py-1.5 file:text-white"
                      />
                      {qrError && (
                        <p className="text-sm text-red-600 mt-1">{qrError}</p>
                      )}
                      {form.paymentQrUrl && (
                        <div className="mt-2 flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={form.paymentQrUrl}
                            alt="QR preview"
                            className="h-20 w-20 object-contain rounded border"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setForm((p) => ({ ...p, paymentQrUrl: "" }))
                            }
                            className="text-sm text-red-600 underline"
                          >
                            Remove QR
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </fieldset>

              {/* Agreement */}
              <label className="flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-4 w-4 mt-0.5"
                />
                <span>
                  I confirm the details above are accurate and I accept the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-usmPurple underline font-medium"
                  >
                    USM Evently Organizer Agreement
                  </Link>
                  , including that admins may remove this event or block my
                  account if it violates the rules.
                </span>
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3">
                <Button type="submit" disabled={busy || !agreed}>
                  {busy
                    ? "Saving..."
                    : editingId
                      ? "Update Event"
                      : "Create Event"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetForm}
                    disabled={busy}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

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
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatEventDate(event.date)} · {event.campus} ·{" "}
                      {event.price > 0 ? `RM ${event.price.toFixed(2)}` : "Free"}
                      {event.isPast ? " · Past" : " · Upcoming"}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      onClick={() => startEdit(event)}
                    >
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

            {/* Block an email up-front */}
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

            {/* Registered users */}
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
