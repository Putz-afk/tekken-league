/*
  Warnings:

  - You are about to drop the column `gamesLost` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `gamesWon` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `matchDraws` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `matchLosses` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `matchWins` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `roundDifferential` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `totalRoundsLost` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `totalRoundsWon` on the `players` table. All the data in the column will be lost.
  - You are about to drop the `_LeagueToPlayer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_LeagueToPlayer" DROP CONSTRAINT "_LeagueToPlayer_A_fkey";

-- DropForeignKey
ALTER TABLE "_LeagueToPlayer" DROP CONSTRAINT "_LeagueToPlayer_B_fkey";

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_matchId_fkey";

-- AlterTable
ALTER TABLE "players" DROP COLUMN "gamesLost",
DROP COLUMN "gamesWon",
DROP COLUMN "matchDraws",
DROP COLUMN "matchLosses",
DROP COLUMN "matchWins",
DROP COLUMN "points",
DROP COLUMN "roundDifferential",
DROP COLUMN "totalRoundsLost",
DROP COLUMN "totalRoundsWon";

-- DropTable
DROP TABLE "_LeagueToPlayer";

-- CreateTable
CREATE TABLE "player_league_stats" (
    "playerId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "matchWins" INTEGER NOT NULL DEFAULT 0,
    "matchLosses" INTEGER NOT NULL DEFAULT 0,
    "matchDraws" INTEGER NOT NULL DEFAULT 0,
    "gamesWon" INTEGER NOT NULL DEFAULT 0,
    "gamesLost" INTEGER NOT NULL DEFAULT 0,
    "totalRoundsWon" INTEGER NOT NULL DEFAULT 0,
    "totalRoundsLost" INTEGER NOT NULL DEFAULT 0,
    "roundDifferential" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "player_league_stats_pkey" PRIMARY KEY ("playerId","leagueId")
);

-- AddForeignKey
ALTER TABLE "player_league_stats" ADD CONSTRAINT "player_league_stats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_league_stats" ADD CONSTRAINT "player_league_stats_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
