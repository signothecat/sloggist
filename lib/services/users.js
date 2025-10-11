// lib/services/users.js
import { prisma } from "@/lib/prisma";

// user確認・見つからなければcreateする関数
// tx = prisma (default) : ensureUser呼び出し時にtxにトランザクション中のPrismaインスタンスが渡されればそれになる
export async function ensureUser({ token, tx = prisma }) {
  console.log("ensureUser発火");

  // uuidか判定
  const isUuid = s => typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

  // tokenでuserを探し、存在すればその内容を返す
  if (token) {
    console.log("tokenからuser検索開始...");

    const foundUser = await tx.user.findUnique({ where: { token } }); // 見つからなければ foundUser = null
    // 見つかった場合、created: false で user を返す
    if (foundUser) return { user: foundUser, created: false };
  }

  // 上でuserが存在しなければ、createする（tokenはdb側で@default(uuid())で生成）
  const user = await tx.user.create({
    // usernameのみこちらで生成（UI実装前の仮運用）
    data: { username: `user-${Math.random().toString(36).slice(2, 8)}` }
  });
  // createしたら、created: trueで user を返す

  console.log("userが見つからなかったため、作成しました");
  return { user, created: true };
}
