import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { eventSchema } from "@/lib/validations";
import { serializeEvent } from "@/lib/events";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { type } = req.query;
    const now = new Date();

    const where =
      type === "upcoming"
        ? { date: { gte: now } }
        : type === "past"
          ? { date: { lt: now } }
          : {};

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: type === "past" ? "desc" : "asc" },
    });

    return res.status(200).json({ events: events.map(serializeEvent) });
  }

  if (req.method === "POST") {
    const session = await requireAdmin(req, res);
    if (!session) return;

    // The organizer must accept the User Agreement to publish an event.
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

    const { date, capacity, ...rest } = parsed.data;
    const event = await prisma.event.create({
      data: {
        ...rest,
        date: new Date(date),
        capacity: capacity ?? null,
      },
    });

    return res.status(201).json({ event: serializeEvent(event) });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}
