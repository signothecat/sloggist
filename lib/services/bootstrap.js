// lib/services/bootstrap.js
import { prisma } from "@/lib/prisma";
import { ensureHome } from "./channels";
import { ensureUser } from "./users";

// 一言で言うとuserを取得する関数
// argsでoptionsを拡張可能
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
      const homeName = `#home:${user.username}`;
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
  });
}
