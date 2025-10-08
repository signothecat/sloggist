// lib/services/channels.js
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// userのHomeチャンネルを参照して返す関数
export async function ensureHome({ userId, tx = prisma, homeName }) {
  // すでにhomeIdが設定されていればそれを返す
  const withHome = await tx.user.findUnique({
    where: { id: userId },
    select: {
      homeId: true,
      home: { select: { id: true, slug: true, name: true, isHome: true } }
    }
  });
  if (withHome?.home) return withHome.home;

  // homeIdが未設定の場合
  // Homeチャンネルを作成し、user.homeIdにそのidを追加し、home channelを返す

  try {
    const channel = await tx.channel.create({
      // isHome: trueであるチャンネルをcreateする
      data: { userId, isHome: true, name: homeName },
      select: { id: true, slug: true, name: true, isHome: true }
    });

    // user.homeIdに作成したチャンネルのidを追加
    await tx.user.update({
      where: { id: userId },
      data: { homeId: channel.id }
    });

    // チャンネルを返す
    return channel;
  } catch (e) {
    // 同時作成などの競合でhomeIdがunique制約に引っかかった場合、homeを再取得する
    // Prisma P2002 "Unique constraint failed on the {constraint}"
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      // userのhomeを改めて取得する
      const again = await tx.user.findUnique({
        where: { id: userId },
        select: {
          home: { select: { id: true, slug: true, name: true, isHome: true } }
        }
      });

      // 再作成が成功してfindUniqueでhomeが取得できていれば、その内容を返す
      if (again?.home) return again.home;
    }

    // それでもだめならerrorを投げる
    throw e;
  }
}
