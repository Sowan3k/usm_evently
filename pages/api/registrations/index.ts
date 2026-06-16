import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeEvent } from "@/lib/events";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAuth(req, res);
  if (!session) return;

  const userId = session.user.id;

  if (req.method === "GET") {
    const registrations = await prisma.registration.findMany({
      where: { userId },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({
      registrations: registrations.map((r) => ({
        id: r.id,
        status: r.status,
        event: serializeEvent(r.event),
      })),
    });
  }

  if (req.method === "POST") {
    const { eventId } = req.body ?? {};
    if (!eventId || typeof eventId !== "string") {
      return res.status(400).json({ error: "eventId is required" });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    if (event.date.getTime() < Date.now()) {
      return res
        .status(400)
        .json({ error: "You cannot register for a past event" });
    }

    // Enforce capacity if the event has one.
    if (event.capacity != null) {
      const count = await prisma.registration.count({
        where: { eventId, status: "REGISTERED" },
      });
      if (count >= event.capacity) {
        return res.status(409).json({ error: "This event is full" });
      }
    }

    const registration = await prisma.registration.upsert({
      where: { userId_eventId: { userId, eventId } },
      update: { status: "REGISTERED" },
      create: { userId, eventId, status: "REGISTERED" },
    });

    return res.status(201).json({
      registration: { id: registration.id, status: registration.status },
      requiresPayment: event.price > 0,
    });
  }

  if (req.method === "DELETE") {
    const { eventId } = req.body ?? {};
    if (!eventId || typeof eventId !== "string") {
      return res.status(400).json({ error: "eventId is required" });
    }
    await prisma.registration
      .delete({ where: { userId_eventId: { userId, eventId } } })
      .catch(() => null);
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed" });
}
