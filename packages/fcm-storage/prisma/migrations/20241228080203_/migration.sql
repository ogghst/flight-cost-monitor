/*
  Warnings:

  - A unique constraint covering the columns `[githubId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "githubId" TEXT;
ALTER TABLE "User" ADD COLUMN "githubProfile" TEXT;
ALTER TABLE "User" ADD COLUMN "image" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
