import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { paymentSchema } from "@/lib/validations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }

  const { eventId, amount, description } = parsed.data;

  // This is a simulated payment gateway: we record the transaction but never
  // store raw card details. In production this would call a real PSP (Stripe).
  const payment = await prisma.payment.create({
    data: {
      userId: session.user.id,
      eventId: eventId || null,
      amount,
      description: description || null,
      status: "COMPLETED",
    },
    select: { id: true, amount: true, description: true, status: true },
  });

  return res.status(201).json({ payment });
}
