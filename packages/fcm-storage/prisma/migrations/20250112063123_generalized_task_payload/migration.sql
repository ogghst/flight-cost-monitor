/*
  Warnings:

  - You are about to drop the column `searchId` on the `TaskSchedule` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TaskSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL DEFAULT '',
    "payload" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL,
    "timeout" INTEGER NOT NULL,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "lastRunAt" DATETIME,
    "nextRunAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "TaskSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TaskSchedule" ("createdAt", "cronExpression", "deletedAt", "description", "id", "lastRunAt", "maxRetries", "name", "nextRunAt", "state", "timeout", "updatedAt", "userId") SELECT "createdAt", "cronExpression", "deletedAt", "description", "id", "lastRunAt", "maxRetries", "name", "nextRunAt", "state", "timeout", "updatedAt", "userId" FROM "TaskSchedule";
DROP TABLE "TaskSchedule";
ALTER TABLE "new_TaskSchedule" RENAME TO "TaskSchedule";
CREATE INDEX "TaskSchedule_userId_idx" ON "TaskSchedule"("userId");
CREATE INDEX "TaskSchedule_state_idx" ON "TaskSchedule"("state");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
