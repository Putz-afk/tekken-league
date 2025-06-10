-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_leagueId_fkey";

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
