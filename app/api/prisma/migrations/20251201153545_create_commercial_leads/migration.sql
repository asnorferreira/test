-- CreateTable
CREATE TABLE "commercial_leads" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "services" TEXT[],
    "estimatedHeadcount" INTEGER NOT NULL,
    "needsDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commercial_leads_pkey" PRIMARY KEY ("id")
);
