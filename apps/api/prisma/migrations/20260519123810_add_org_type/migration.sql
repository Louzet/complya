-- CreateEnum
CREATE TYPE "complya"."OrgType" AS ENUM ('CABINET', 'SME');

-- AlterTable
ALTER TABLE "complya"."organizations" ADD COLUMN "type" "complya"."OrgType" NOT NULL DEFAULT 'SME';
