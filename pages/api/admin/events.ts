import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

// Approve or reject an event submitted to the moderation queue.
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

  const { id, status, rejectionReason } = req.body ?? {};
  if (typeof id !== "string" || !["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "id and a valid status are required" });
  }

  try {
    await prisma.event.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason || "Rejected" : null,
      },
    });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(404).json({ error: "Event not found" });
  }
}
