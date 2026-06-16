import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { eventSchema } from "@/lib/validations";
import { serializeEvent } from "@/lib/events";
import { storeImage } from "@/lib/storage";

export const config = {
  api: { bodyParser: { sizeLimit: "8mb" } },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;

  if (req.method === "GET") {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    return res.status(200).json({ event: serializeEvent(event) });
  }

  if (req.method === "PUT") {
    const session = await requireAdmin(req, res);
    if (!session) return;

    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    }

    const { date, capacity, posterUrl, paymentQrUrl, ...rest } = parsed.data;
    try {
      const event = await prisma.event.update({
        where: { id },
        data: {
          ...rest,
          posterUrl: await storeImage(posterUrl, "poster"),
          paymentQrUrl: await storeImage(paymentQrUrl, "qr"),
          date: new Date(date),
          capacity: capacity ?? null,
        },
      });
      return res.status(200).json({ event: serializeEvent(event) });
    } catch {
      return res.status(404).json({ error: "Event not found" });
    }
  }

  if (req.method === "DELETE") {
    const session = await requireAdmin(req, res);
    if (!session) return;

    try {
      await prisma.event.delete({ where: { id } });
      return res.status(204).end();
    } catch {
      return res.status(404).json({ error: "Event not found" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed" });
}
