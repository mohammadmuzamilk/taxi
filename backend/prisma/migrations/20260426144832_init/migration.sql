-- CreateEnum
CREATE TYPE "Role" AS ENUM ('client', 'driver', 'admin');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('offline', 'online', 'busy');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('REGISTERED', 'DOCUMENTS_UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('searching', 'accepted', 'arrived', 'ongoing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('LMV', 'COMMERCIAL', 'TWO_WHEELER');

-- CreateEnum
CREATE TYPE "GovIdType" AS ENUM ('AADHAAR', 'PAN', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('Bike', 'Auto', 'Car', 'SUV');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'client',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "profile_photo" TEXT,
    "license_number" TEXT,
    "license_expiry" TIMESTAMP(3),
    "license_type" "LicenseType",
    "license_front_image" TEXT,
    "license_back_image" TEXT,
    "gov_id_type" "GovIdType",
    "gov_id_number" TEXT,
    "gov_id_front_image" TEXT,
    "gov_id_back_image" TEXT,
    "vehicle_type" "VehicleType",
    "vehicle_model" TEXT,
    "vehicle_plate" TEXT,
    "vehicle_color" TEXT,
    "vehicle_year" INTEGER,
    "vehicle_photo" TEXT,
    "doc_aadhaar" TEXT,
    "doc_pan" TEXT,
    "doc_rc" TEXT,
    "bank_account" TEXT,
    "ifsc_code" TEXT,
    "account_holder" TEXT,
    "upi_id" TEXT,
    "city" TEXT,
    "preferred_area" TEXT,
    "availability" TEXT,
    "self_declaration" BOOLEAN NOT NULL DEFAULT false,
    "emergency_contact" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'REGISTERED',
    "rejection_reason" TEXT,
    "status" "DriverStatus" NOT NULL DEFAULT 'offline',
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 5.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rides" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_name" TEXT,
    "client_phone" TEXT,
    "driver_id" TEXT,
    "driver_name" TEXT,
    "driver_phone" TEXT,
    "driver_vehicle" TEXT,
    "driver_lat" DECIMAL(10,7),
    "driver_lng" DECIMAL(10,7),
    "pickup_address" TEXT NOT NULL,
    "pickup_lat" DECIMAL(10,7),
    "pickup_lng" DECIMAL(10,7),
    "drop_address" TEXT NOT NULL,
    "drop_lat" DECIMAL(10,7),
    "drop_lng" DECIMAL(10,7),
    "fare" DECIMAL(10,2),
    "distance" TEXT,
    "duration" TEXT,
    "status" "RideStatus" NOT NULL DEFAULT 'searching',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "ride_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_method" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "otps_phone_idx" ON "otps"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_user_id_key" ON "drivers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_phone_key" ON "drivers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_license_number_key" ON "drivers"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "payments_ride_id_key" ON "payments"("ride_id");

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rides" ADD CONSTRAINT "rides_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rides" ADD CONSTRAINT "rides_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_ride_id_fkey" FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;
