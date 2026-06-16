import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { blockEmailSchema } from "@/lib/validations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const blocked = await prisma.blockedEmail.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({
      blockedEmails: blocked.map((b) => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
      })),
    });
  }

  if (req.method === "POST") {
    const parsed = blockEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    }
    const email = parsed.data.email.toLowerCase().trim();
    const reason = parsed.data.reason || "Blocked by admin";

    const blockedEmail = await prisma.blockedEmail.upsert({
      where: { email },
      update: { reason },
      create: { email, reason },
    });

    // If an account already exists for this address, block it too.
    await prisma.user.updateMany({
      where: { email },
      data: { blocked: true, blockedReason: reason },
    });

    return res.status(201).json({
      blockedEmail: { ...blockedEmail, createdAt: blockedEmail.createdAt.toISOString() },
    });
  }

  if (req.method === "DELETE") {
    const email = String(req.query.email ?? req.body?.email ?? "")
      .toLowerCase()
      .trim();
    if (!email) return res.status(400).json({ error: "email is required" });

    await prisma.blockedEmail.deleteMany({ where: { email } });
    await prisma.user.updateMany({
      where: { email },
      data: { blocked: false, blockedReason: null },
    });

    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed" });
}
