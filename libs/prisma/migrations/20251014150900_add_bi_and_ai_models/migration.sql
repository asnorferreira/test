/*
  Warnings:

  - Added the required column `tenantId` to the `conversations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `negotiation_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `pillars` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `policies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `scripts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SuggestionRating" AS ENUM ('GOOD', 'BAD', 'NEUTRAL');

-- DropForeignKey
ALTER TABLE "public"."scripts" DROP CONSTRAINT "scripts_campaignId_fkey";

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "negotiation_rules" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "pillars" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "policies" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "scripts" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "conversation_events" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "conversationId" TEXT NOT NULL,

    CONSTRAINT "conversation_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_suggestions" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "ai_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestion_feedbacks" (
    "id" TEXT NOT NULL,
    "rating" "SuggestionRating" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suggestionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "suggestion_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_analyses" (
    "id" TEXT NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "adherenceRate" DOUBLE PRECISION NOT NULL,
    "metrics" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "conversation_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suggestion_feedbacks_suggestionId_key" ON "suggestion_feedbacks"("suggestionId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_analyses_conversationId_key" ON "conversation_analyses"("conversationId");

-- AddForeignKey
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_events" ADD CONSTRAINT "conversation_events_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "conversation_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestion_feedbacks" ADD CONSTRAINT "suggestion_feedbacks_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "ai_suggestions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_analyses" ADD CONSTRAINT "conversation_analyses_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
