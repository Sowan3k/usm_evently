import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

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

  const { registrationId } = req.body ?? {};
  if (typeof registrationId !== "string") {
    return res.status(400).json({ error: "registrationId is required" });
  }

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { event: true },
  });
  if (!registration) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  // Only an admin or the event's organizer may check tickets in.
  const isOwner = registration.event.submittedById === session.user.id;
  if (session.user.role !== "ADMIN" && !isOwner) {
    return res
      .status(403)
      .json({ error: "Only the organizer or an admin can check in tickets" });
  }

  if (registration.status === "ATTENDED") {
    return res.status(200).json({ alreadyCheckedIn: true });
  }

  // Mark attended and award the event's MyCSD points to the attendee, once.
  await prisma.$transaction([
    prisma.registration.update({
      where: { id: registrationId },
      data: { status: "ATTENDED", attendedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: registration.userId },
      data: { myCSDPoints: { increment: registration.event.csdPoints } },
    }),
  ]);

  return res
    .status(200)
    .json({ checkedIn: true, pointsAwarded: registration.event.csdPoints });
}
