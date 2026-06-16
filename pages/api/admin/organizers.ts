import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

// Approve or reject a user's request for organizer access.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, status } = req.body ?? {};
  if (typeof userId !== "string" || !["APPROVED", "REJECTED"].includes(status)) {
    return res
      .status(400)
      .json({ error: "userId and a valid status are required" });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { organizerStatus: status },
    });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(404).json({ error: "User not found" });
  }
}
