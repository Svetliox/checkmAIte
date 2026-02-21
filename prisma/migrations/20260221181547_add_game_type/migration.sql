-- DropForeignKey
ALTER TABLE "SavedGame" DROP CONSTRAINT "SavedGame_userId_fkey";

-- AlterTable
ALTER TABLE "SavedGame" ADD COLUMN     "gameType" TEXT NOT NULL DEFAULT 'analysis';

-- AddForeignKey
ALTER TABLE "SavedGame" ADD CONSTRAINT "SavedGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
