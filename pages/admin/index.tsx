import type { GetServerSideProps } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
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

type AdminProps = {
  events: SerializedEvent[];
};

export const getServerSideProps: GetServerSideProps<AdminProps> = async (
  ctx
) => {
  const session = await getAuthSession(ctx);
  if (!session) return loginRedirect;
  if (session.user.role !== "ADMIN") return adminRedirect;

  const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
  return { props: { events: events.map(serializeEvent) } };
};

type FormState = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  imageUrl: string;
  category: string;
  capacity: string;
  price: string;
  csdPoints: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  imageUrl: "",
  category: "",
  capacity: "",
  price: "0",
  csdPoints: "0",
};

export default function AdminDashboard({ events }: AdminProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => router.replace(router.asPath);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (event: SerializedEvent) => {
    setEditingId(event.id);
    setError(null);
    setForm({
      title: event.title,
      description: event.description,
      date: event.date.slice(0, 10),
      startTime: event.startTime ?? "",
      endTime: event.endTime ?? "",
      location: event.location,
      imageUrl: event.imageUrl ?? "",
      category: event.category ?? "",
      capacity: event.capacity?.toString() ?? "",
      price: event.price.toString(),
      csdPoints: event.csdPoints.toString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      ...form,
      capacity: form.capacity === "" ? undefined : form.capacity,
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

  const field = (
    label: string,
    name: keyof FormState,
    type = "text",
    placeholder = ""
  ) => (
    <div>
      <label className="block text-sm text-gray-700 font-medium">{label}</label>
      <Input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {field("Title", "title")}
                {field("Category", "category", "text", "e.g. Career")}
                {field("Date", "date", "date")}
                {field("Location", "location")}
                {field("Start Time", "startTime", "text", "09:00 AM")}
                {field("End Time", "endTime", "text", "05:00 PM")}
                {field("Image URL", "imageUrl", "text", "/event1.jpg")}
                {field("Capacity", "capacity", "number", "optional")}
                {field("Price (RM)", "price", "number")}
                {field("MyCSD Points", "csdPoints", "number")}
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-usmPurple"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3">
                <Button type="submit" disabled={busy}>
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
                      {formatEventDate(event.date)} · {event.location} ·{" "}
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
      </main>
      <Footer />
    </div>
  );
}
