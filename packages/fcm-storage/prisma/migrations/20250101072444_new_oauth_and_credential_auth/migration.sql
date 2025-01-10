/*
  Warnings:

  - You are about to drop the `PermissionType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSearch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `action` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `resource` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `typeId` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `githubId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `githubProfile` on the `User` table. All the data in the column will be lost.
  - Added the required column `name` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PermissionType_id_key";

-- DropIndex
DROP INDEX "UserSearch_lastUsed_idx";

-- DropIndex
DROP INDEX "UserSearch_userId_favorite_idx";

-- DropIndex
DROP INDEX "UserSearch_userId_searchType_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PermissionType";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserSearch";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "replacedByToken" TEXT,
    "family" TEXT NOT NULL,
    "generationNumber" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Permission" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "Permission";
DROP TABLE "Permission";
ALTER TABLE "new_Permission" RENAME TO "Permission";
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");
CREATE TABLE "new_Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Role" ("createdAt", "description", "id", "name", "updatedAt") SELECT "createdAt", "description", "id", "name", "updatedAt" FROM "Role";
DROP TABLE "Role";
ALTER TABLE "new_Role" RENAME TO "Role";
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "authType" TEXT NOT NULL DEFAULT 'CREDENTIALS',
    "oauthProvider" TEXT,
    "oauthProviderId" TEXT,
    "oauthProfile" TEXT,
    "image" TEXT,
    "lastLogin" DATETIME,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);
INSERT INTO "new_User" ("active", "createdAt", "deletedAt", "email", "firstName", "id", "image", "lastName", "password", "updatedAt") SELECT "active", "createdAt", "deletedAt", "email", "firstName", "id", "image", "lastName", "password", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_username_idx" ON "User"("username");
CREATE UNIQUE INDEX "User_oauthProvider_oauthProviderId_key" ON "User"("oauthProvider", "oauthProviderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");
