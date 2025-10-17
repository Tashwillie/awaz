-- CreateEnum
CREATE TYPE "PhoneNumberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "CallForwardingStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "PhoneSystemType" AS ENUM ('MOBILE', 'VOIP', 'PSTN', 'LANDLINE');

-- AlterTable
ALTER TABLE "Call" ADD COLUMN     "twilioCallSid" TEXT,
ADD COLUMN     "recordingUrl" TEXT,
ADD COLUMN     "rating" INTEGER;

-- CreateIndex
CREATE INDEX "Call_twilioCallSid_idx" ON "Call"("twilioCallSid");

-- CreateTable
CREATE TABLE "PhoneNumber" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "twilioSid" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "areaCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "status" "PhoneNumberStatus" NOT NULL DEFAULT 'ACTIVE',
    "provider" TEXT NOT NULL DEFAULT 'twilio',

    CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallForwardingConfig" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phoneSystemType" "PhoneSystemType" NOT NULL,
    "provider" TEXT NOT NULL,
    "userPhoneNumber" TEXT NOT NULL,
    "funnderPhoneNumber" TEXT NOT NULL,
    "status" "CallForwardingStatus" NOT NULL DEFAULT 'PENDING',
    "setupInstructions" TEXT[],
    "lastTestedAt" TIMESTAMP(3),

    CONSTRAINT "CallForwardingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCallConfig" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "allowedNumbers" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "TestCallConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingInfo" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trialMinutes" INTEGER NOT NULL DEFAULT 60,
    "usedMinutes" INTEGER NOT NULL DEFAULT 0,
    "remainingMinutes" INTEGER NOT NULL DEFAULT 60,
    "trialEndDate" TIMESTAMP(3) NOT NULL,
    "hasPaymentMethod" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'trial',
    "plan" TEXT NOT NULL DEFAULT 'trial',
    "pricePerMinute" DOUBLE PRECISION NOT NULL DEFAULT 0.02,

    CONSTRAINT "BillingInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentConfig" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentName" TEXT NOT NULL DEFAULT 'Funnder',
    "greeting" TEXT NOT NULL,
    "backgroundNoise" TEXT NOT NULL DEFAULT 'Office',
    "includeRecordingDisclaimer" BOOLEAN NOT NULL DEFAULT true,
    "faqs" JSONB NOT NULL,
    "customQuestions" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "AgentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallMetrics" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalCalls" INTEGER NOT NULL DEFAULT 0,
    "answeredCalls" INTEGER NOT NULL DEFAULT 0,
    "missedCalls" INTEGER NOT NULL DEFAULT 0,
    "averageDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "CallMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_twilioSid_key" ON "PhoneNumber"("twilioSid");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_number_key" ON "PhoneNumber"("number");

-- CreateIndex
CREATE INDEX "PhoneNumber_sessionId_idx" ON "PhoneNumber"("sessionId");

-- CreateIndex
CREATE INDEX "PhoneNumber_number_idx" ON "PhoneNumber"("number");

-- CreateIndex
CREATE UNIQUE INDEX "CallForwardingConfig_sessionId_key" ON "CallForwardingConfig"("sessionId");

-- CreateIndex
CREATE INDEX "CallForwardingConfig_sessionId_idx" ON "CallForwardingConfig"("sessionId");

-- CreateIndex
CREATE INDEX "CallForwardingConfig_status_idx" ON "CallForwardingConfig"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TestCallConfig_sessionId_key" ON "TestCallConfig"("sessionId");

-- CreateIndex
CREATE INDEX "TestCallConfig_sessionId_idx" ON "TestCallConfig"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingInfo_sessionId_key" ON "BillingInfo"("sessionId");

-- CreateIndex
CREATE INDEX "BillingInfo_sessionId_idx" ON "BillingInfo"("sessionId");

-- CreateIndex
CREATE INDEX "BillingInfo_status_idx" ON "BillingInfo"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AgentConfig_sessionId_key" ON "AgentConfig"("sessionId");

-- CreateIndex
CREATE INDEX "AgentConfig_sessionId_idx" ON "AgentConfig"("sessionId");

-- CreateIndex
CREATE INDEX "AgentConfig_status_idx" ON "AgentConfig"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CallMetrics_sessionId_key" ON "CallMetrics"("sessionId");

-- CreateIndex
CREATE INDEX "CallMetrics_sessionId_idx" ON "CallMetrics"("sessionId");

-- CreateIndex
CREATE INDEX "CallMetrics_date_idx" ON "CallMetrics"("date");
