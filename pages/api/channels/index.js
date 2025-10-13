// pages/api/channels/index.js
import { getTokenCookie } from "@/lib/server/cookies";
import { prisma } from "@/lib/server/prisma";
import { requireUser } from "@/lib/server/services/users";
import { HttpError } from "@/lib/shared/errors";
import { respond } from "@/pages/api/_utils/respond";

export const SAFE_CHANNEL_SELECT = {
  userId: true,
  name: true,
  slug: true,
  isHome: true,
};

export default async function handler(req, res) {
  await respond(req, res, async () => {
    const token = getTokenCookie(req) ?? null;
    const user = await requireUser({ token }); // tokenでuserが解決しなければ401

    if (req.method === "GET") {
      const channels = await prisma.channel.findMany({
        where: { userId: user.id },
        select: SAFE_CHANNEL_SELECT,
        orderBy: { createdAt: "asc" },
      });
      return res.status(200).json(channels);
    }

    if (req.method === "POST") {
      const maxNameLength = 40;
      const rawName = req.body?.name;
      const newName = typeof rawName === "string" ? rawName.trim() : "";

      if (!newName)
        throw new HttpError(400, "Name is required", {
          code: "CHANNEL_NAME_REQUIRED",
        });
      if (newName.length > maxNameLength) {
        throw new HttpError(400, "Name cannot exceed 40 characters.", {
          code: "CHANNEL_NAME_TOO_LONG",
          meta: { len: newName.length },
        });
      }

      try {
        const channel = await prisma.channel.create({
          data: { name: newName, userId: user.id },
          select: SAFE_CHANNEL_SELECT,
        });
        return res.status(201).json(channel);
      } catch (e) {
        // Prisma unique 衝突
        if (e?.code === "P2002") {
          throw new HttpError(409, "Channel already exists", {
            code: "CHANNEL_NAME_CONFLICT",
            meta: { username: user.username, channelName: newName },
          });
        }
        throw e; // それ以外は500 系でrespond()が処理
      }
    }

    // Not allowed
    res.setHeader("Allow", ["GET", "POST"]);
    throw new HttpError(405, "Method Not Allowed", {
      code: "METHOD_NOT_ALLOWED",
      meta: { method: req.method },
    });
  });
}
