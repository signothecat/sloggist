// lib/services/bootstrap.js
import { prisma } from "@/lib/prisma";
import { ensureHome } from "./channels";
import { ensureUser } from "./users";

// 一言で言うとuserをhomeを確実にして取得する関数
export async function bootstrapUserContext(args = {}) {
  // argsで受け取った内容を入れる、受け取っていない値は以下に書いたdefault値
  const { token, createHome = true, seed = false } = args;

  // 一連の処理をトランザクションで包んで実行
  return prisma.$transaction(async tx => {
    // ensureUserの返り値の、userをconst userに入れ、keyがcreatedであるプロパティの値をconst userCreatedに入れる
    const { user, created: userCreated } = await ensureUser({ token, tx });

    // if needed: homeを作成
    let home = null;
    if (createHome) {
      const homeName = `home:${user.username}`;
      home = await ensureHome({ userId: user.id, tx, homeName: homeName });
    }

    // if needed: seed適用
    // e.g. ホームに初回ログを適用
    if (seed && userCreated && home) {
      // await tx.log.create({ data: { userId: user.id, channelId: home.id, content: "Welcome!" } })
    }

    return {
      user,
      home, // { id, slug, name } | null
      homeSlug: home?.slug ?? null,
      created: { user: userCreated, home: Boolean(home) }
    };
  }); // トランザクション終わり
}

// tokenとslugからuserとchannelを解決する関数
export async function bootstrapChannelContext(args = {}) {
  const { token, slug, createHome = true } = args;

  // slugの型チェック
  if (typeof slug !== "string" || !slug) {
    const e = new Error("Invalid slug");
    e.status = 400;
    throw e;
  }

  // 一連の処理をトランザクションで包んで実行
  return prisma.$transaction(async tx => {
    // 認証（必要なら createHome も可変に）
    const { user } = await ensureUser({ token, tx });

    // user.id が見つからない場合、先にerrorを投げる
    if (!user?.id) {
      const e = new Error("Unauthorized");
      e.status = 401;
      throw e;
    }

    // user.id における user スコープで slug を解決
    const channel = await tx.channel.findFirst({
      where: { userId: user.id, slug },
      select: { id: true, slug: true, name: true, isHome: true }
    });

    if (!channel) {
      const e = new Error("Channel not found");
      e.status = 404;
      throw e;
    }

    // 万が一homeがない場合に備えてensureHome
    let home = null;
    if (createHome) {
      const homeName = `home:${user.username}`;
      home = await ensureHome({ userId: user.id, tx, homeName });
    }

    return { user, channel, home };
  }); // トランザクション終わり
}
