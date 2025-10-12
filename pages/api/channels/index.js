// pages/api/channels/index.js
import { getTokenCookie } from "@/lib/cookies";
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { respond } from "@/pages/api/_utils/respond";
import { requireUser } from "@/services/users";

export default async function handler(req, res) {
  await respond(req, res, async () => {
    const token = getTokenCookie(req) ?? null;
    const user = await requireUser({ token }); // tokenでuserが解決しなければ401

    if (req.method === "GET") {
      const channels = await prisma.channel.findMany({
        where: { userId: user.id },
        select: { id: true, name: true, slug: true },
        orderBy: { createdAt: "asc" }
      });
      return res.status(200).json(channels);
    }

    if (req.method === "POST") {
      const maxNameLength = 40;
      const rawName = req.body?.name;
      const name = typeof rawName === "string" ? rawName.trim() : "";

      if (!name)
        throw new HttpError(400, "Name is required", {
          code: "CHANNEL_NAME_REQUIRED"
        });
      if (name.length > maxNameLength) {
        throw new HttpError(400, "Name cannot exceed 40 characters.", {
          code: "CHANNEL_NAME_TOO_LONG",
          meta: { len: name.length }
        });
      }

      try {
        const channel = await prisma.channel.create({
          data: { name, userId: user.id },
          select: { id: true, name: true, slug: true }
        });
        return res.status(201).json(channel);
      } catch (e) {
        // Prisma unique 衝突
        if (e?.code === "P2002") {
          throw new HttpError(409, "Channel already exists", {
            code: "CHANNEL_NAME_CONFLICT",
            meta: { userId: user.id, name }
          });
        }
        throw e; // それ以外は500 系でrespond()が処理
      }
    }

    // Not allowed
    res.setHeader("Allow", ["GET", "POST"]);
    throw new HttpError(405, "Method Not Allowed", {
      code: "METHOD_NOT_ALLOWED",
      meta: { method: req.method }
    });
  });
}
