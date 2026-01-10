-- AlterTable
ALTER TABLE "User" ADD COLUMN "country" TEXT,
ADD COLUMN "preferredCurrency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN "currencyChangedAt" TIMESTAMP(3),
ADD COLUMN "fiatBalance" DECIMAL(20,2) NOT NULL DEFAULT 0,
ADD COLUMN "cryptoBalance" DECIMAL(20,8) NOT NULL DEFAULT 0,
ADD COLUMN "walletAddress" TEXT,
ADD COLUMN "autoOfframpEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "fiatAmount" DECIMAL(20,2),
ADD COLUMN "fiatCurrency" TEXT,
ADD COLUMN "cryptoAmount" DECIMAL(20,8),
ADD COLUMN "cryptoCurrency" TEXT DEFAULT 'USDC',
ADD COLUMN "fees" DECIMAL(20,2) NOT NULL DEFAULT 0,
ADD COLUMN "feeBreakdown" JSONB,
ADD COLUMN "senderUserId" TEXT,
ADD COLUMN "recipientUserId" TEXT,
ADD COLUMN "recipientEmail" TEXT,
ADD COLUMN "onrampOrderId" TEXT,
ADD COLUMN "offrampOrderId" TEXT,
ADD COLUMN "onMetaRefNumber" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_senderUserId_idx" ON "Transaction"("senderUserId");
CREATE INDEX "Transaction_recipientUserId_idx" ON "Transaction"("recipientUserId");
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL DEFAULT 'USDC',
    "rate" DECIMAL(20,8) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_fromCurrency_toCurrency_key" ON "ExchangeRate"("fromCurrency", "toCurrency");
CREATE INDEX "ExchangeRate_fromCurrency_idx" ON "ExchangeRate"("fromCurrency");
CREATE INDEX "ExchangeRate_toCurrency_idx" ON "ExchangeRate"("toCurrency");

