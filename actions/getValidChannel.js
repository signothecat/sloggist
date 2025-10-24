// actions/getValidChannel.js
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getOwnedChannel } from "@/services/channels/getOwnedChannel";
import { requireUser } from "@/services/users/requireUser";

// slugでchannelを返し、userとchannelを返す
export const getValidChannel = async ({ token, slug }) => {
  if (typeof slug !== "string" || !slug) {
    // slugの形式が正しくなければerrorを返す
    throw new HttpError(400, "Invalid slug", {
      code: "INVALID_SLUG",
    });
  }
  return prisma.$transaction(async tx => {
    const user = await requireUser({ token, tx }); // tokenでuserが見つからなければ401エラーで中断
    const channel = await getOwnedChannel({ userId: user.id, slug, tx }); // channelが見つからなければ404
    return { user, channel }; // TBF: これuserからidを抜かないといけない
  });
};
