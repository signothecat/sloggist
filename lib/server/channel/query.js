// lib/server/channel/query.js
import { prisma } from "@/lib/server/prisma";
import { HttpError } from "@/lib/shared/errors";

// userIdスコープでslugのchannelを探す関数
// bootstrapChannelで呼ばれる
export async function getOwnedChannel({ userId, slug, tx = prisma }) {
  const targetChannel = await tx.channel.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, isHome: true, userId: true }
  });

  if (!targetChannel) {
    throw new HttpError(404, "Channel not found", {
      code: "CHANNEL_NOT_FOUND",
      meta: { slug }
    });
  }
  if (targetChannel.userId !== userId) {
    throw new HttpError(404, "Channel forbidden", {
      code: "CHANNEL_FORBIDDEN",
      meta: { slug, requestedBy: userId },
      expose: false
    });
  }

  const { userId: _omit, ...safe } = targetChannel; // userId（DBの主キー）は棄却、それ以外をsafeに
  return safe;
}
