import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

// A logged-in user requests organizer access, which an admin then reviews.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await requireAuth(req, res);
  if (!session) return;

  const { organization, organizerNote } = req.body ?? {};
  if (typeof organization !== "string" || organization.trim().length < 2) {
    return res
      .status(400)
      .json({ error: "Please name the club/society you represent" });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizerStatus: true },
  });
  if (me?.organizerStatus === "APPROVED") {
    return res.status(400).json({ error: "You are already an organizer" });
  }
  if (me?.organizerStatus === "PENDING") {
    return res.status(400).json({ error: "Your request is already pending" });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      organizerStatus: "PENDING",
      organization: organization.trim(),
      organizerNote: typeof organizerNote === "string" ? organizerNote.trim() : null,
    },
  });

  return res.status(200).json({ ok: true });
}
