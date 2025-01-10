-- CreateTable
CREATE TABLE "FlightOfferSearch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "searchType" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "savedSearchId" TEXT,
    "status" TEXT NOT NULL,
    "totalResults" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "FlightOfferSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FlightOfferSearch_savedSearchId_fkey" FOREIGN KEY ("savedSearchId") REFERENCES "UserSearch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlightOfferResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "validatingCarrier" TEXT NOT NULL,
    "segments" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "FlightOfferResult_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "FlightOfferSearch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "FlightOfferSearch_userId_idx" ON "FlightOfferSearch"("userId");

-- CreateIndex
CREATE INDEX "FlightOfferSearch_searchType_idx" ON "FlightOfferSearch"("searchType");

-- CreateIndex
CREATE INDEX "FlightOfferResult_searchId_idx" ON "FlightOfferResult"("searchId");

-- CreateIndex
CREATE INDEX "FlightOfferResult_offerId_idx" ON "FlightOfferResult"("offerId");
