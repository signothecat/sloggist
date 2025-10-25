// services/channels/getChannelsByUser.js
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { SAFE_CHANNEL_SELECT, toChannelDisplay } from "./channelContract";

export async function getChannelsByUser({ userId, tx = prisma }) {
  if (!userId) {
    throw new HttpError(400, "User authentication is required", {
      code: "USER_ID_REQUIRED",
      internalMessage: "getChannelsByUser called without userId",
    });
  }

  try {
    const channels = await tx.channel.findMany({
      where: { userId },
      select: SAFE_CHANNEL_SELECT, // TBF: SAFE_にしたい
      orderBy: { createdAt: "asc" },
    });
    return channels.map(toChannelDisplay); // ChannelDisplay[]型
  } catch (e) {
    throw new HttpError(500, "Internal Server Error", {
      code: "DB_ERROR",
      internalMessage: e?.message,
      meta: { operation: "channel.findMany", userId },
      cause: e,
    });
  }
}
