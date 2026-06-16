import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { USM_CAMPUSES, USM_SCHOOLS } from "@/lib/constants";
import type { SerializedEvent } from "@/lib/events";

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

function formFromEvent(e: SerializedEvent): FormState {
  return {
    title: e.title,
    description: e.description,
    date: e.date.slice(0, 10),
    startTime: e.startTime ?? "",
    endTime: e.endTime ?? "",
    location: e.location,
    campus: e.campus,
    school: e.school ?? "",
    organizer: e.organizer ?? "",
    dressCode: e.dressCode ?? "",
    culturalNotes: e.culturalNotes ?? "",
    emergencyContact: e.emergencyContact,
    imageUrl: e.imageUrl ?? "",
    posterUrl: e.posterUrl ?? "",
    category: e.category ?? "",
    capacity: e.capacity?.toString() ?? "",
    price: e.price.toString(),
    csdPoints: e.csdPoints.toString(),
    bankName: e.bankName ?? "",
    bankAccountName: e.bankAccountName ?? "",
    bankAccountNumber: e.bankAccountNumber ?? "",
    tngNumber: e.tngNumber ?? "",
    paymentInstructions: e.paymentInstructions ?? "",
    paymentQrUrl: e.paymentQrUrl ?? "",
  };
}

const MAX_POSTER_BYTES = 5 * 1024 * 1024; // 5 MB

type EventFormResult = { pendingReview?: boolean };

export default function EventForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: SerializedEvent | null;
  onSaved?: (result: EventFormResult) => void;
  onCancel?: () => void;
}) {
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState<FormState>(
    initial ? formFromEvent(initial) : emptyForm
  );
  const [openToPublic, setOpenToPublic] = useState(initial?.openToPublic ?? false);
  const [useExternalPayment, setUseExternalPayment] = useState(
    initial?.useExternalPayment ?? false
  );
  const [agreed, setAgreed] = useState(editing); // already agreed when editing
  const [error, setError] = useState<string | null>(null);
  const [posterError, setPosterError] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const readImageInto =
    (field: "posterUrl" | "paymentQrUrl", setErr: (m: string | null) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please accept the Organizer Agreement first.");
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
        editing ? `/api/events/${initial!.id}` : "/api/events",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      if (!editing) {
        setForm(emptyForm);
        setOpenToPublic(false);
        setUseExternalPayment(false);
        setAgreed(false);
      }
      onSaved?.({ pendingReview: data.pendingReview });
    } catch {
      setError("Something went wrong");
    } finally {
      setBusy(false);
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

  const textareaClass =
    "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-usmPurple";

  return (
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
            className={textareaClass}
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
              className={textareaClass}
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
              className={textareaClass}
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
            className={textareaClass}
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
                  onClick={() => setForm((p) => ({ ...p, posterUrl: "" }))}
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
          Use my own payment details instead of platform checkout (optional)
        </label>
        {useExternalPayment && (
          <div className="space-y-4 rounded-md border border-gray-200 p-4">
            <p className="text-xs text-gray-500">
              Provide at least one way for attendees to pay you (bank, Touch
              &apos;n Go, or a QR code). Shown on the event page for paid events.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field("Bank name", "bankName", "text", "e.g. Maybank")}
              {field("Account holder name", "bankAccountName")}
              {field("Account number", "bankAccountNumber")}
              {field("Touch 'n Go (eWallet no./ID)", "tngNumber", "text", "+60...")}
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
                className={textareaClass}
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
              {qrError && <p className="text-sm text-red-600 mt-1">{qrError}</p>}
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
                    onClick={() => setForm((p) => ({ ...p, paymentQrUrl: "" }))}
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
          , including that admins may remove this event or block my account if it
          violates the rules.
        </span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={busy || !agreed}>
          {busy ? "Saving..." : editing ? "Update Event" : "Submit Event"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
