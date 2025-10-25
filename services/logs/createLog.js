// services/logs/createLog.js
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { SAFE_LOG_SELECT, toLogDisplay } from "./logContract";

const MAX_LENGTH = 10_000;

export const createLog = async ({ userId, channelId, rawContent, tx = prisma }) => {
  if (!userId) {
    throw new HttpError(400, "User authentication is required", {
      code: "USER_ID_REQUIRED",
      internalMessage: "createLog called without userId",
    });
  }
  if (!channelId) {
    throw new HttpError(400, "Something went wrong", {
      code: "CHANNEL_ID_REQUIRED",
      internalMessage: "createLog called without channelId",
    });
  }

  // 文字列チェック・改行正規化
  const content = (typeof rawContent === "string" ? rawContent : "").replace(/\r\n/g, "\n");

  if (!/\S/.test(content)) {
    throw new HttpError(400, "Log content is required", {
      code: "LOG_CONTENT_REQUIRED",
    });
  }
  if (content.length > MAX_LENGTH) {
    throw new HttpError(413, "Log content is too long", {
      code: "LOG_CONTENT_TOO_LONG",
      meta: { length: content.length, max: MAX_LENGTH },
    });
  }

  try {
    const created = await tx.log.create({
      data: { userId, channelId, content },
      select: SAFE_LOG_SELECT,
    });
    return toLogDisplay(created); // LogDisplay型
  } catch (e) {
    throw new HttpError(500, "Internal Server Error", {
      code: "DB_ERROR",
      internalMessage: e?.message,
      meta: { operation: "log.create", userId, channelId },
      cause: e,
    });
  }
};
