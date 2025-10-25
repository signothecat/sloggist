// actions/bootstrapUser.js
import { prisma } from "@/lib/prisma";
import { ensureHome } from "@/services/channels/ensureHome";
import { ensureAvatar } from "@/services/users/ensureAvatar";
import { ensureUser } from "@/services/users/ensureUser";

// userとhomeとavatarをensureし、必ずuserとhomeを返す
// index.jsのみで呼ばれている
export const bootstrapUser = async ({ token }) => {
  return prisma.$transaction(async tx => {
    // userを確保
    const { user, created: userCreated } = await ensureUser({ token, tx });

    // homeを確保
    const homeName = `home:${user.username}`;
    const home = await ensureHome({ userId: user.id, tx, homeName });

    // avatarを確保
    const { created: avatarCreated } = await ensureAvatar({ userId: user.id, tx });

    return {
      user,
      home,
      homeSlug: home?.slug ?? null,
      created: { user: userCreated, home: true, avatar: avatarCreated }, // TBF: homeをcreateしなくてもtrueになる可能性があるのでhomeCreatedで受けるようにしたい
    };
  });
};
