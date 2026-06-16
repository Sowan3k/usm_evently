import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { eventSchema } from "@/lib/validations";
import { serializeEvent } from "@/lib/events";
import { storeImage } from "@/lib/storage";

// Allow larger bodies so a base64 poster/QR (up to ~5 MB) can be uploaded.
export const config = {
  api: { bodyParser: { sizeLimit: "8mb" } },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { type } = req.query;
    const now = new Date();

    const dateWhere =
      type === "upcoming"
        ? { date: { gte: now } }
        : type === "past"
          ? { date: { lt: now } }
          : {};

    // The public API only ever returns approved events.
    const events = await prisma.event.findMany({
      where: { ...dateWhere, status: "APPROVED" },
      orderBy: { date: type === "past" ? "desc" : "asc" },
    });

    return res.status(200).json({ events: events.map(serializeEvent) });
  }

  if (req.method === "POST") {
    const session = await requireAuth(req, res);
    if (!session) return;

    const isAdmin = session.user.role === "ADMIN";
    if (!isAdmin) {
      const me = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizerStatus: true },
      });
      if (me?.organizerStatus !== "APPROVED") {
        return res.status(403).json({
          error: "You need approved organizer access to submit events",
        });
      }
    }

    // The organizer must accept the User Agreement to submit an event.
    if (req.body?.agreedToTerms !== true) {
      return res.status(400).json({
        error: "You must accept the USM Evently Organizer Agreement",
      });
    }

    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    }

    const { date, capacity, posterUrl, paymentQrUrl, ...rest } = parsed.data;
    const event = await prisma.event.create({
      data: {
        ...rest,
        posterUrl: await storeImage(posterUrl, "poster"),
        paymentQrUrl: await storeImage(paymentQrUrl, "qr"),
        date: new Date(date),
        capacity: capacity ?? null,
        // Admin-created events go live immediately; organizer submissions
        // wait in the moderation queue.
        status: isAdmin ? "APPROVED" : "PENDING",
        submittedById: isAdmin ? null : session.user.id,
      },
    });

    return res.status(201).json({
      event: serializeEvent(event),
      pendingReview: !isAdmin,
    });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}
