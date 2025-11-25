/*
  Warnings:

  - Changed the type of `type` on the `ai_suggestions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SuggestionType" AS ENUM ('SCRIPT', 'ACTION', 'ALERT');

-- AlterTable
ALTER TABLE "ai_suggestions" DROP COLUMN "type",
ADD COLUMN     "type" "SuggestionType" NOT NULL;
