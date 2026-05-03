/*
  Warnings:

  - The values [Bike,Auto,Car,SUV] on the enum `VehicleType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VehicleType_new" AS ENUM ('CAR', 'AUTO', 'BIKE');
ALTER TABLE "drivers" ALTER COLUMN "vehicle_type" TYPE "VehicleType_new" USING ("vehicle_type"::text::"VehicleType_new");
ALTER TABLE "rides" ALTER COLUMN "vehicle_type" TYPE "VehicleType_new" USING ("vehicle_type"::text::"VehicleType_new");
ALTER TYPE "VehicleType" RENAME TO "VehicleType_old";
ALTER TYPE "VehicleType_new" RENAME TO "VehicleType";
DROP TYPE "VehicleType_old";
COMMIT;

-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "doc_aadhaar" TEXT,
ADD COLUMN     "doc_pan" TEXT,
ADD COLUMN     "doc_rc" TEXT;
