// lib/server/prisma.js
import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  // 本番環境なら
  prisma = new PrismaClient();
} else {
  // 開発環境なら
  // 開発中のホットリロードで多重生成しないよう、global変数に一度だけ入れ、次のホットリロードでも再利用する
  if (!global.prisma) {
    // Node.jsのglobalオブジェクトをチェックし、global.prismaが存在しなければ
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export { prisma };
