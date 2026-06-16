import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { blockUserSchema } from "@/lib/validations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        blocked: true,
        blockedReason: true,
        createdAt: true,
        _count: { select: { registrations: true } },
      },
    });
    return res.status(200).json({
      users: users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
        registrationCount: u._count.registrations,
      })),
    });
  }

  if (req.method === "PATCH") {
    const { userId } = req.body ?? {};
    if (typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    if (userId === session.user.id) {
      return res.status(400).json({ error: "You cannot block yourself" });
    }

    const parsed = blockUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    }
    const { blocked, reason } = parsed.data;

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return res.status(404).json({ error: "User not found" });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { blocked, blockedReason: blocked ? reason || "Blocked by admin" : null },
      select: { id: true, blocked: true, blockedReason: true },
    });

    // Keep the email blocklist in sync so a blocked person can't simply
    // re-register with the same address.
    if (blocked) {
      await prisma.blockedEmail.upsert({
        where: { email: target.email },
        update: { reason: reason || "Blocked by admin" },
        create: { email: target.email, reason: reason || "Blocked by admin" },
      });
    } else {
      await prisma.blockedEmail.deleteMany({ where: { email: target.email } });
    }

    return res.status(200).json({ user });
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ error: "Method not allowed" });
}
