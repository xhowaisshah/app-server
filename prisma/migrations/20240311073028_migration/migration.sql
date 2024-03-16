-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'USER');

-- CreateTable
CREATE TABLE "UPS" (
    "id" SERIAL NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "userRefId" INTEGER,
    "wifi" TEXT NOT NULL,

    CONSTRAINT "UPS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "passwordOtp" INTEGER,
    "OtpExpiry" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "profile" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UPSData" (
    "id" SERIAL NOT NULL,
    "serialNumber" INTEGER NOT NULL,
    "upsId" INTEGER NOT NULL,
    "inputVoltage" DOUBLE PRECISION NOT NULL,
    "inputFaultVoltage" DOUBLE PRECISION NOT NULL,
    "outputVoltage" DOUBLE PRECISION NOT NULL,
    "outputCurrent" DOUBLE PRECISION NOT NULL,
    "inputFrequency" DOUBLE PRECISION NOT NULL,
    "batteryVoltage" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UPSData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UPS_serialNumber_key" ON "UPS"("serialNumber");

-- CreateIndex
CREATE INDEX "UPS_id_serialNumber_idx" ON "UPS"("id", "serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "UPSData_upsId_timestamp_idx" ON "UPSData"("upsId", "timestamp");

-- AddForeignKey
ALTER TABLE "UPS" ADD CONSTRAINT "UPS_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UPS" ADD CONSTRAINT "UPS_userRefId_fkey" FOREIGN KEY ("userRefId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UPSData" ADD CONSTRAINT "UPSData_upsId_fkey" FOREIGN KEY ("upsId") REFERENCES "UPS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
