-- CreateTable
CREATE TABLE "TaskSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "searchId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL,
    "timeout" INTEGER NOT NULL,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "lastRunAt" DATETIME,
    "nextRunAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "TaskSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskSchedule_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "UserSearch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "duration" INTEGER,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "error" TEXT,
    "result" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "TaskExecution_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "TaskSchedule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "totalRuns" INTEGER NOT NULL DEFAULT 0,
    "successfulRuns" INTEGER NOT NULL DEFAULT 0,
    "failedRuns" INTEGER NOT NULL DEFAULT 0,
    "averageDuration" REAL NOT NULL DEFAULT 0,
    "lastExecutionState" TEXT NOT NULL,
    "lastError" TEXT,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "TaskStats_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "TaskSchedule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TaskSchedule_userId_idx" ON "TaskSchedule"("userId");

-- CreateIndex
CREATE INDEX "TaskSchedule_searchId_idx" ON "TaskSchedule"("searchId");

-- CreateIndex
CREATE INDEX "TaskSchedule_state_idx" ON "TaskSchedule"("state");

-- CreateIndex
CREATE INDEX "TaskExecution_taskId_idx" ON "TaskExecution"("taskId");

-- CreateIndex
CREATE INDEX "TaskExecution_state_idx" ON "TaskExecution"("state");

-- CreateIndex
CREATE INDEX "TaskExecution_startTime_idx" ON "TaskExecution"("startTime");

-- CreateIndex
CREATE INDEX "TaskStats_taskId_idx" ON "TaskStats"("taskId");

-- CreateIndex
CREATE INDEX "TaskStats_periodStart_idx" ON "TaskStats"("periodStart");

-- CreateIndex
CREATE INDEX "TaskStats_periodEnd_idx" ON "TaskStats"("periodEnd");
