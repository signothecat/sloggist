// actions/bootstrapUser.js
import { prisma } from "@/lib/prisma";
import { ensureHome } from "@/services/channels/ensureHome";
import { getOrCreateUser } from "@/services/users/getOrCreateUser";

// userが未登録なら作成し、homeもensureし、必ずuserとhomeを返す
// index.jsのみで呼ばれている
export const bootstrapUser = async ({ token }) => {
  return prisma.$transaction(async tx => {
    const { user, created: userCreated } = await getOrCreateUser({ token, tx });

    const homeName = `home:${user.username}`;
    const home = await ensureHome({ userId: user.id, tx, homeName });

    return {
      user,
      home,
      homeSlug: home?.slug ?? null,
      created: { user: userCreated, home: true }, // TBF: homeをcreateしなくてもtrueになる可能性があるのでhomeCreatedで受けるようにしたい
    };
  });
};
