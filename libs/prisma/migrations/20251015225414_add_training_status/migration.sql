-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('NOT_TRAINED', 'PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "policies" ADD COLUMN     "lastTrainedAt" TIMESTAMP(3),
ADD COLUMN     "trainingStatus" "TrainingStatus" NOT NULL DEFAULT 'NOT_TRAINED';
