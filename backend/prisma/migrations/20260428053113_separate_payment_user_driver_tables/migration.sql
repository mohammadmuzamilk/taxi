/*
  Warnings:

  - You are about to drop the column `account_holder` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `bank_account` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `doc_aadhaar` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `doc_pan` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `doc_rc` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `ifsc_code` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `upi_id` on the `drivers` table. All the data in the column will be lost.
  - The `payment_method` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[vehicle_plate]` on the table `drivers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gateway_order_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gateway_payment_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'CARD', 'WALLET');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUNDED';

-- AlterTable
ALTER TABLE "drivers" DROP COLUMN "account_holder",
DROP COLUMN "bank_account",
DROP COLUMN "doc_aadhaar",
DROP COLUMN "doc_pan",
DROP COLUMN "doc_rc",
DROP COLUMN "ifsc_code",
DROP COLUMN "upi_id",
ADD COLUMN     "total_earnings" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_rides" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vehicle_rc" TEXT;

-- AlterTable
ALTER TABLE "otps" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "failure_reason" TEXT,
ADD COLUMN     "gateway_name" TEXT,
ADD COLUMN     "gateway_order_id" TEXT,
ADD COLUMN     "gateway_payment_id" TEXT,
ADD COLUMN     "gateway_signature" TEXT,
ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "refund_amount" DECIMAL(10,2),
ADD COLUMN     "refunded_at" TIMESTAMP(3),
DROP COLUMN "payment_method",
ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CASH';

-- AlterTable
ALTER TABLE "rides" ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "started_at" TIMESTAMP(3),
ADD COLUMN     "vehicle_type" "VehicleType";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "client_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_photo" TEXT,
    "home_address" TEXT,
    "work_address" TEXT,
    "preferred_method" "PaymentMethod",
    "total_rides" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_bank_details" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "bank_name" TEXT,
    "account_holder" TEXT,
    "account_number" TEXT,
    "ifsc_code" TEXT,
    "upi_id" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_bank_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_earnings" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "ride_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ride_ratings" (
    "id" TEXT NOT NULL,
    "ride_id" TEXT NOT NULL,
    "client_rating" INTEGER,
    "driver_rating" INTEGER,
    "client_comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ride_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_user_id_key" ON "client_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "driver_bank_details_driver_id_key" ON "driver_bank_details"("driver_id");

-- CreateIndex
CREATE UNIQUE INDEX "driver_earnings_ride_id_key" ON "driver_earnings"("ride_id");

-- CreateIndex
CREATE INDEX "driver_earnings_driver_id_idx" ON "driver_earnings"("driver_id");

-- CreateIndex
CREATE UNIQUE INDEX "ride_ratings_ride_id_key" ON "ride_ratings"("ride_id");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_vehicle_plate_key" ON "drivers"("vehicle_plate");

-- CreateIndex
CREATE UNIQUE INDEX "payments_gateway_order_id_key" ON "payments"("gateway_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_gateway_payment_id_key" ON "payments"("gateway_payment_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "rides_client_id_idx" ON "rides"("client_id");

-- CreateIndex
CREATE INDEX "rides_driver_id_idx" ON "rides"("driver_id");

-- CreateIndex
CREATE INDEX "rides_status_idx" ON "rides"("status");

-- AddForeignKey
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_bank_details" ADD CONSTRAINT "driver_bank_details_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_earnings" ADD CONSTRAINT "driver_earnings_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_earnings" ADD CONSTRAINT "driver_earnings_ride_id_fkey" FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride_ratings" ADD CONSTRAINT "ride_ratings_ride_id_fkey" FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;
