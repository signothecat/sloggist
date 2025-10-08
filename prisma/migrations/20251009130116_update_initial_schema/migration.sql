/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `channels` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `intervals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `logs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[homeId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - The required column `token` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "public"."users_handle_key";

-- AlterTable
ALTER TABLE "channels" ADD COLUMN     "isHome" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "intervals" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "logs" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "homeId" UUID,
ADD COLUMN     "token" UUID NOT NULL,
ADD COLUMN     "username" TEXT,
ALTER COLUMN "handle" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "channels_slug_key" ON "channels"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "intervals_slug_key" ON "intervals"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "logs_slug_key" ON "logs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_slug_key" ON "sessions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_token_key" ON "users"("token");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_homeId_key" ON "users"("homeId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
