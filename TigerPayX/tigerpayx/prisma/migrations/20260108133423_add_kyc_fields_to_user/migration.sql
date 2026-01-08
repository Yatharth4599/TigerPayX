-- AlterTable
ALTER TABLE "User" ADD COLUMN "kycVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "kycVerifiedAt" TIMESTAMP(3),
ADD COLUMN "kycStatus" TEXT,
ADD COLUMN "onmetaKycRefNumber" TEXT,
ADD COLUMN "onmetaAccessToken" TEXT,
ADD COLUMN "onmetaRefreshToken" TEXT,
ADD COLUMN "onmetaTokenExpiresAt" TIMESTAMP(3);

