import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { profileUpdateSchema } from "@/lib/validations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (req.method === "PUT") {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
      },
      select: { id: true, name: true, email: true, phone: true },
    });

    return res.status(200).json({ user });
  }

  res.setHeader("Allow", ["PUT"]);
  return res.status(405).json({ error: "Method not allowed" });
}
