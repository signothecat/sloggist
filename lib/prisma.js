// lib/prisma.js
import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  // 本番環境
  prisma = new PrismaClient();
} else {
  // 開発環境
  // ホットリロードで多重生成しないよう、global変数に一度だけ入れ、次のホットリロードで再利用する
  if (!global.prisma) {
    // Node.jsのglobalオブジェクトをチェックし、global.prismaが存在しなければ
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export { prisma };
