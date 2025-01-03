-- AlterTable
ALTER TABLE "Permission" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN "deletedAt" DATETIME;

-- CreateTable
CREATE TABLE "UserSearch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "searchType" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "name" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "lastUsed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "UserSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserSearch_userId_idx" ON "UserSearch"("userId");

-- CreateIndex
CREATE INDEX "UserSearch_searchType_idx" ON "UserSearch"("searchType");
