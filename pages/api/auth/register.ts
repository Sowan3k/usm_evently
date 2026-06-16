import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }

  const { name, email, password, identityType, identityNumber } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Reject sign-ups from addresses an admin has blocked.
  const banned = await prisma.blockedEmail.findUnique({
    where: { email: normalizedEmail },
  });
  if (banned) {
    return res
      .status(403)
      .json({ error: "This email has been blocked by an administrator." });
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return res
      .status(409)
      .json({ error: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      identityType,
      identityNumber: identityNumber.trim(),
    },
    select: { id: true, name: true, email: true },
  });

  return res.status(201).json({ user });
}
