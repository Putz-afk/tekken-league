/*
  Warnings:

  - You are about to drop the column `leagueId` on the `players` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "players" DROP CONSTRAINT "players_leagueId_fkey";

-- AlterTable
ALTER TABLE "players" DROP COLUMN "leagueId";

-- CreateTable
CREATE TABLE "_LeagueToPlayer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LeagueToPlayer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LeagueToPlayer_B_index" ON "_LeagueToPlayer"("B");

-- AddForeignKey
ALTER TABLE "_LeagueToPlayer" ADD CONSTRAINT "_LeagueToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeagueToPlayer" ADD CONSTRAINT "_LeagueToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
