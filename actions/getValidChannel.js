// actions/getValidChannel.js
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getOwnedChannel } from "@/services/channels/getOwnedChannel";
import { requireUser } from "@/services/users/requireUser";

// user検証(user | 401) -> channel検証（channel | 400 | 404）
export const getValidChannel = async ({ token, slug, tx = prisma }) => {
  if (typeof slug !== "string" || !slug) {
    throw new HttpError(400, "Something went wrong", {
      code: "INVALID_SLUG",
      internalMessage: "getValidChannel called with invalid slug (empty or non-string)",
    });
  }

  try {
    const user = await requireUser({ token, tx }); // user | 401
    const channel = await getOwnedChannel({ userId: user.id, slug, tx }); // channel | 400 | 404

    return channel;
  } catch (e) {
    // 下位からHttpErrorが投げられていれば、そのまま上位へ渡す
    if (e instanceof HttpError) throw e;

    throw new HttpError(500, "Internal Server Error", {
      code: "DB_ERROR",
      internalMessage: e?.message,
      meta: { operation: "getValidChannel", slug },
      cause: e,
    });
  }
};
