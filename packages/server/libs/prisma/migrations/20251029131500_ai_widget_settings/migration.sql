-- Add AI and widget configuration fields
ALTER TABLE "tenants"
    ADD COLUMN "widgetEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN "defaultAiProvider" TEXT,
    ADD COLUMN "defaultAiModel" TEXT;

ALTER TABLE "campaigns"
    ADD COLUMN "aiEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN "aiProvider" TEXT,
    ADD COLUMN "aiModel" TEXT;
