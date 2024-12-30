-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "typeId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT '',
    "resource" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Permission_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "PermissionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Permission" ("createdAt", "deletedAt", "id", "resource", "roleId", "typeId", "updatedAt") SELECT "createdAt", "deletedAt", "id", "resource", "roleId", "typeId", "updatedAt" FROM "Permission";
DROP TABLE "Permission";
ALTER TABLE "new_Permission" RENAME TO "Permission";
CREATE UNIQUE INDEX "Permission_roleId_typeId_resource_key" ON "Permission"("roleId", "typeId", "resource");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
