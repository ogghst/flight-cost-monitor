-- CreateTable
CREATE TABLE "UserSearch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "searchType" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "title" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "lastUsed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserSearch_userId_searchType_idx" ON "UserSearch"("userId", "searchType");

-- CreateIndex
CREATE INDEX "UserSearch_userId_favorite_idx" ON "UserSearch"("userId", "favorite");

-- CreateIndex
CREATE INDEX "UserSearch_lastUsed_idx" ON "UserSearch"("lastUsed");