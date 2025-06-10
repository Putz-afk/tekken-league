// src/app/league/[leagueId]/page.tsx
import { DataTable } from "@/components/data-table";
import { columns, Participant as DataTableParticipant } from "@/components/columns";
import MatchList, { MatchWithPlayers } from "@/components/MatchList";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

type GameDetails = {
  winnerId: string | null;
  loserId: string | null;
  winnerRounds: number;
  loserRounds: number;
};

export default async function LeaguePage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const leagueQueryResult = await prisma.league.findUnique({
    where: { slug: slug },
    include: {
      participants: {
        include: {
          player: {
            select: { name: true, id: true },
          },
        },
        orderBy: [
          { points: 'desc' },
          { roundDifferential: 'desc' },
          { gamesWon: 'desc' },
        ],
      },
      matches: {
        include: {
          homePlayer: true,
          awayPlayer: true,
          games: true,
        },
        orderBy: [{ day: 'asc' }, { matchDate: 'asc' }],
      },
    },
  });

  if (!leagueQueryResult) {
    notFound();
  }

  const leagueId = leagueQueryResult.id;

  const leagueParticipants: DataTableParticipant[] = leagueQueryResult.participants
    .filter(stats => stats.player.name !== 'Bye') // Exclude "Bye" player from standings
    .map(stats => ({
      id: stats.playerId,
      name: stats.player.name,
      points: stats.points,
      wins: stats.matchWins,
      losses: stats.matchLosses,
      draws: stats.matchDraws,
      gamesWon: stats.gamesWon,
      gamesLost: stats.gamesLost,
      totalRoundsWon: stats.totalRoundsWon,
      totalRoundsLost: stats.totalRoundsLost,
      roundDifferential: stats.roundDifferential,
  }));

  const transformedMatches: MatchWithPlayers[] = leagueQueryResult.matches.map(match => {
    const game1Data = match.games.find(g => g.gameNumber === 1);
    const game2Data = match.games.find(g => g.gameNumber === 2);
    const defaultGameDetails: GameDetails = { winnerId: null, loserId: null, winnerRounds: 0, loserRounds: 0 };

    let p1Score = 0;
    let p2Score = 0;
    if (match.isCompleted) {
        if (match.homePlayerMatchPoints === 3) p1Score = 2;
        if (match.awayPlayerMatchPoints === 3) p2Score = 2;
        if (match.homePlayerMatchPoints === 1) { p1Score = 1; p2Score = 1; }
    }

    return {
      ...match,
      player1: match.homePlayer,
      player2: match.awayPlayer,
      day: match.day || 1,
      player1Score: p1Score,
      player2Score: p2Score,
      game1: game1Data ? { winnerId: game1Data.winnerId, loserId: game1Data.loserId, winnerRounds: game1Data.winnerRounds, loserRounds: game1Data.loserRounds } : defaultGameDetails,
      game2: game2Data ? { winnerId: game2Data.winnerId, loserId: game2Data.loserId, winnerRounds: game2Data.winnerRounds, loserRounds: game2Data.loserRounds } : defaultGameDetails,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="flex items-center gap-2 text-sm text-yellow-400 hover:underline mb-4">
            <FaArrowLeft /> Back to All Leagues
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">{leagueQueryResult.name}</h1>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-200">Standings</h2>
        <DataTable columns={columns} data={leagueParticipants} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-200">Match Schedule</h2>
        <MatchList matches={transformedMatches} leagueId={leagueId} />
      </div>
    </div>
  );
}