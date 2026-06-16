import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  // Every account must be a verifiable USM student or staff member.
  identityType: z.enum(["MATRIC", "IC", "PASSPORT"], {
    errorMap: () => ({ message: "Please choose an ID type" }),
  }),
  identityNumber: z
    .string()
    .min(4, "Please enter your matric number / IC / passport")
    .max(40),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(30).optional().or(z.literal("")),
});

// ~5 MB raw file -> base64 data URL is roughly 6.8 MB of text. Allow a little
// headroom so a valid 5 MB poster is never rejected by the length guard.
const MAX_POSTER_CHARS = 7_200_000;

export const eventSchema = z.object({
  title: z.string().min(2, "Title is required").max(150),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
  startTime: z.string().max(20).optional().or(z.literal("")),
  endTime: z.string().max(20).optional().or(z.literal("")),
  location: z.string().min(2, "Location is required").max(200),
  campus: z.string().min(2, "Please select which USM campus this event is at").max(120),
  school: z.string().max(150).optional().or(z.literal("")),
  organizer: z.string().max(150).optional().or(z.literal("")),
  openToPublic: z.coerce.boolean().default(false),
  dressCode: z.string().max(200).optional().or(z.literal("")),
  culturalNotes: z.string().max(1000).optional().or(z.literal("")),
  emergencyContact: z
    .string()
    .min(5, "An organizer emergency helpline is required")
    .max(120),
  imageUrl: z.string().max(300).optional().or(z.literal("")),
  posterUrl: z
    .string()
    .max(MAX_POSTER_CHARS, "Poster image is too large (max 5 MB)")
    .refine(
      (v) => v === "" || /^data:image\/(png|jpe?g);base64,/.test(v),
      "Poster must be a JPG or PNG image"
    )
    .optional()
    .or(z.literal("")),
  category: z.string().max(60).optional().or(z.literal("")),
  capacity: z.coerce.number().int().nonnegative().optional(),
  price: z.coerce.number().nonnegative().default(0),
  csdPoints: z.coerce.number().int().nonnegative().default(0),

  // Optional alternative (organizer-provided) payment details.
  useExternalPayment: z.coerce.boolean().default(false),
  bankName: z.string().max(120).optional().or(z.literal("")),
  bankAccountName: z.string().max(120).optional().or(z.literal("")),
  bankAccountNumber: z.string().max(60).optional().or(z.literal("")),
  tngNumber: z.string().max(60).optional().or(z.literal("")),
  paymentInstructions: z.string().max(500).optional().or(z.literal("")),
  paymentQrUrl: z
    .string()
    .max(MAX_POSTER_CHARS, "QR image is too large (max 5 MB)")
    .refine(
      (v) => v === "" || /^data:image\/(png|jpe?g);base64,/.test(v),
      "QR must be a JPG or PNG image"
    )
    .optional()
    .or(z.literal("")),
});

export const blockEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  reason: z.string().max(200).optional().or(z.literal("")),
});

export const blockUserSchema = z.object({
  blocked: z.coerce.boolean(),
  reason: z.string().max(200).optional().or(z.literal("")),
});

export const paymentSchema = z.object({
  eventId: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().max(200).optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type EventInput = z.infer<typeof eventSchema>;
