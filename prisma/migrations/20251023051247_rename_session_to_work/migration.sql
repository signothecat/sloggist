/*
  Warnings:

  - You are about to drop the column `sessionId` on the `intervals` table. All the data in the column will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `workId` to the `intervals` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('active', 'paused', 'ended');

-- DropForeignKey
ALTER TABLE "public"."intervals" DROP CONSTRAINT "intervals_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_channelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropIndex
DROP INDEX "public"."intervals_sessionId_startedAt_idx";

-- AlterTable
ALTER TABLE "intervals" DROP COLUMN "sessionId",
ADD COLUMN     "workId" UUID NOT NULL;

-- DropTable
DROP TABLE "public"."sessions";

-- DropEnum
DROP TYPE "public"."SessionStatus";

-- CreateTable
CREATE TABLE "works" (
    "id" UUID NOT NULL,
    "slug" TEXT,
    "userId" UUID NOT NULL,
    "name" TEXT,
    "details" TEXT,
    "channelId" UUID NOT NULL,
    "startedAt" TIMESTAMPTZ(6),
    "endedAt" TIMESTAMPTZ(6),
    "status" "WorkStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "works_slug_key" ON "works"("slug");

-- CreateIndex
CREATE INDEX "works_userId_idx" ON "works"("userId");

-- CreateIndex
CREATE INDEX "works_channelId_status_startedAt_idx" ON "works"("channelId", "status", "startedAt");

-- CreateIndex
CREATE INDEX "intervals_workId_startedAt_idx" ON "intervals"("workId", "startedAt");

-- AddForeignKey
ALTER TABLE "works" ADD CONSTRAINT "works_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "works" ADD CONSTRAINT "works_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervals" ADD CONSTRAINT "intervals_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;
