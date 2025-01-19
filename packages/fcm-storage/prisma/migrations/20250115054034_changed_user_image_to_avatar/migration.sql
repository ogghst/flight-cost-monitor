/*
  Warnings:

  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "avatar" TEXT,
    "lastLogin" DATETIME,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);
INSERT INTO "new_User" ("active", "authType", "createdAt", "deletedAt", "email", "firstName", "id", "lastLogin", "lastName", "oauthProfile", "oauthProvider", "oauthProviderId", "password", "passwordResetExpires", "passwordResetToken", "updatedAt", "username") SELECT "active", "authType", "createdAt", "deletedAt", "email", "firstName", "id", "lastLogin", "lastName", "oauthProfile", "oauthProvider", "oauthProviderId", "password", "passwordResetExpires", "passwordResetToken", "updatedAt", "username" FROM "User";
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
