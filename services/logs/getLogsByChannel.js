// services/logs/getLogsByChannel.js
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { SAFE_LOG_SELECT, toLogDisplay } from "./logContract";

// 指定チャンネルのログを昇順で取得
export const getLogsByChannel = async ({ channelId, tx = prisma }) => {
  if (!channelId) {
    throw new HttpError(400, "Something went wrong", {
      code: "CHANNEL_ID_REQUIRED",
      internalMessage: "getLogsByChannel called without channelId",
    });
  }

  try {
    const logs = await tx.log.findMany({
      where: { channelId },
      orderBy: { createdAt: "asc" },
      select: SAFE_LOG_SELECT,
    });
    return logs.map(toLogDisplay); // LogDisplay[]型
  } catch (e) {
    throw new HttpError(500, "Internal Server Error", {
      code: "DB_ERROR",
      internalMessage: e?.message,
      meta: { operation: "log.findMany", channelId },
      cause: e,
    });
  }
};
