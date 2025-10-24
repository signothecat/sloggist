// services/channels/ensureHome.js
import { prisma } from "@/lib/prisma";

const homeSelect = { id: true, slug: true, name: true, isHome: true };

// userのHomeチャンネルを返す関数
// bootstrapUserでのみ呼ばれている（index.jsでのみ呼ばれる）
// ensureUserしたあとに呼ばれる前提
export async function ensureHome({ userId, tx = prisma, homeName }) {
  // userIdとnameでHomeチャンネルをupsert
  const home = await tx.channel.upsert({
    where: { userId_name: { userId, name: homeName } }, // @@unique([userId, name])
    update: {}, // 既存ならそのまま
    create: { userId, isHome: true, name: homeName }, // なければ作成
    select: homeSelect,
  });

  // User.homeIdをhome.idに更新（すでに設定済みでも問題ない）
  await tx.user.update({
    where: { id: userId },
    data: { homeId: home.id },
  });

  return home;
}
