-- CreateTable
CREATE TABLE "TenderAiSummary" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "companyProfileId" TEXT,
    "content" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "openaiResponseId" TEXT,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "totalTokens" INTEGER,
    "estimatedCostUsd" DECIMAL(12,6),
    "sourceTenderUpdatedAt" TIMESTAMP(3) NOT NULL,
    "sourceCompanyProfileUpdatedAt" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenderAiSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenderAiSummary_tenderId_generatedAt_idx"
ON "TenderAiSummary"("tenderId", "generatedAt");

-- CreateIndex
CREATE INDEX "TenderAiSummary_companyProfileId_idx"
ON "TenderAiSummary"("companyProfileId");

-- AddForeignKey
ALTER TABLE "TenderAiSummary"
ADD CONSTRAINT "TenderAiSummary_tenderId_fkey"
FOREIGN KEY ("tenderId") REFERENCES "Tender"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderAiSummary"
ADD CONSTRAINT "TenderAiSummary_companyProfileId_fkey"
FOREIGN KEY ("companyProfileId") REFERENCES "CompanyProfile"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
