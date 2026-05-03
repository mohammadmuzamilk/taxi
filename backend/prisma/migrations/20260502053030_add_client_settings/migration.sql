-- AlterTable
ALTER TABLE "client_profiles" ADD COLUMN     "biometric_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "data_sharing" JSONB,
ADD COLUMN     "push_notifs" JSONB,
ADD COLUMN     "webauthn_creds" JSONB;
