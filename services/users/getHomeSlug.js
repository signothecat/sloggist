// services/users/getHomeSlug.js
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { requireUser } from "./requireUser";

export const getHomeSlug = async ({ token, tx = prisma }) => {
  const user = await requireUser({ token, tx }); // userが解決しなければ401

  try {
    const found = await tx.user.findUnique({
      where: { id: user.id },
      select: { home: { select: { slug: true } } },
    });
    return found?.home?.slug ?? null;
  } catch (e) {
    throw new HttpError(500, "Internal Server Error", {
      code: "DB_ERROR",
      internalMessage: e?.message,
      meta: { operation: "user.findHomeSlug", userId: user.id },
      cause: e,
    });
  }
};
