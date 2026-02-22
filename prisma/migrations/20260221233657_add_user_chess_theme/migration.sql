-- CreateEnum
CREATE TYPE "ChessTheme" AS ENUM ('ORIGINAL', 'MODERN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "chessTheme" "ChessTheme" NOT NULL DEFAULT 'MODERN';
