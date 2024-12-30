-- AlterTable
ALTER TABLE "Permission" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "deletedAt" DATETIME;
