/*
  Warnings:

  - You are about to drop the column `contractId` on the `ContractItem` table. All the data in the column will be lost.
  - You are about to drop the `Contract` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[serviceContractId,assetId]` on the table `ContractItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serviceContractId` to the `ContractItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_taskId_fkey";

-- DropForeignKey
ALTER TABLE "ContractItem" DROP CONSTRAINT "ContractItem_contractId_fkey";

-- DropIndex
DROP INDEX "ContractItem_contractId_assetId_key";

-- AlterTable
ALTER TABLE "ContractItem" DROP COLUMN "contractId",
ADD COLUMN     "serviceContractId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Contract";

-- CreateTable
CREATE TABLE "ServiceContract" (
    "id" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "ContractType" NOT NULL DEFAULT 'RENTAL',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "isSigned" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceContract_contractNumber_key" ON "ServiceContract"("contractNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ContractItem_serviceContractId_assetId_key" ON "ContractItem"("serviceContractId", "assetId");

-- AddForeignKey
ALTER TABLE "ServiceContract" ADD CONSTRAINT "ServiceContract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractItem" ADD CONSTRAINT "ContractItem_serviceContractId_fkey" FOREIGN KEY ("serviceContractId") REFERENCES "ServiceContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
