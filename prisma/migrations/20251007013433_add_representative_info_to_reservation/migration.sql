-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "representative_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "representative_phone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "representative_email" TEXT NOT NULL DEFAULT '';
