/*
  Warnings:

  - The values [client] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `client_id` on the `rides` table. All the data in the column will be lost.
  - You are about to drop the column `client_name` on the `rides` table. All the data in the column will be lost.
  - You are about to drop the column `client_phone` on the `rides` table. All the data in the column will be lost.
  - You are about to drop the `client_profiles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `rides` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('user', 'driver', 'admin');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user';
COMMIT;

-- DropForeignKey
ALTER TABLE "client_profiles" DROP CONSTRAINT "client_profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "rides" DROP CONSTRAINT "rides_client_id_fkey";

-- DropIndex
DROP INDEX "rides_client_id_idx";

-- AlterTable
ALTER TABLE "rides" DROP COLUMN "client_id",
DROP COLUMN "client_name",
DROP COLUMN "client_phone",
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "user_name" TEXT,
ADD COLUMN     "user_phone" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user';

-- DropTable
DROP TABLE "client_profiles";

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_photo" TEXT,
    "home_address" TEXT,
    "work_address" TEXT,
    "preferred_method" "PaymentMethod",
    "total_rides" INTEGER NOT NULL DEFAULT 0,
    "favorites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "data_sharing" JSONB,
    "push_notifs" JSONB,
    "biometric_enabled" BOOLEAN NOT NULL DEFAULT false,
    "webauthn_creds" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "rides_user_id_idx" ON "rides"("user_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rides" ADD CONSTRAINT "rides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
