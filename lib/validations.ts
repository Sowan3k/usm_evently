import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(30).optional().or(z.literal("")),
});

export const eventSchema = z.object({
  title: z.string().min(2, "Title is required").max(150),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
  startTime: z.string().max(20).optional().or(z.literal("")),
  endTime: z.string().max(20).optional().or(z.literal("")),
  location: z.string().min(2, "Location is required").max(200),
  imageUrl: z.string().max(300).optional().or(z.literal("")),
  category: z.string().max(60).optional().or(z.literal("")),
  capacity: z.coerce.number().int().nonnegative().optional(),
  price: z.coerce.number().nonnegative().default(0),
  csdPoints: z.coerce.number().int().nonnegative().default(0),
});

export const paymentSchema = z.object({
  eventId: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().max(200).optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type EventInput = z.infer<typeof eventSchema>;
