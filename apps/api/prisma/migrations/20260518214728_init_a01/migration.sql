-- CreateEnum
CREATE TYPE "complya"."OrganizationRole" AS ENUM ('ORG_OWNER', 'ORG_ADMIN', 'ORG_MEMBER');

-- CreateTable
CREATE TABLE "complya"."organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complya"."companies" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nif" TEXT,
    "cnssNumber" TEXT,
    "cnamgsNumber" TEXT,
    "country" TEXT NOT NULL DEFAULT 'GA',
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complya"."users" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complya"."user_organizations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "role" "complya"."OrganizationRole" NOT NULL DEFAULT 'ORG_MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "complya"."organizations"("slug");

-- CreateIndex
CREATE INDEX "companies_orgId_idx" ON "complya"."companies"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkUserId_key" ON "complya"."users"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "complya"."users"("email");

-- CreateIndex
CREATE INDEX "users_clerkUserId_idx" ON "complya"."users"("clerkUserId");

-- CreateIndex
CREATE INDEX "user_organizations_orgId_idx" ON "complya"."user_organizations"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "user_organizations_userId_orgId_key" ON "complya"."user_organizations"("userId", "orgId");

-- AddForeignKey
ALTER TABLE "complya"."companies" ADD CONSTRAINT "companies_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "complya"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complya"."user_organizations" ADD CONSTRAINT "user_organizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "complya"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complya"."user_organizations" ADD CONSTRAINT "user_organizations_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "complya"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
