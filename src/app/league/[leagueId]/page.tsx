// src/app/league/[leagueId]/page.tsx
import { DataTable } from "@/components/data-table";
import { columns, Participant as DataTableParticipant } from "@/components/columns";
import MatchList from "@/components/MatchList";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

import { League, Player, Match, Game, Prisma } from '@prisma/client';

// This type from Prisma is correct for the initial fetch.
type MatchFromPrisma = Match & {
  homePlayer: Player;
  awayPlayer: Player;
  games: Game[];
};

// This is the type that your child components (MatchList, MatchResultModal) ACTUALLY need.
// Let's define it clearly here.
type GameDetails = {
  winnerId: string | null;
  loserId: string | null;
  winnerRounds: number;
  loserRounds: number;
};

// This is the final, transformed shape of a match object.
export type MatchForComponents = Match & {
  homePlayer: Player; // Keep original for reference
  awayPlayer: Player; // Keep original for reference
  player1: Player;      // The property the components are looking for
  player2: Player;      // The property the components are looking for
  day: number;
  player1Score: number;
  player2Score: number;
  game1: GameDetails;
  game2: GameDetails;
};


export default async function LeaguePage({ params }: { params: { leagueId: string } }) {
  const { leagueId } = await params;

  if (!leagueId) {
    notFound();
  }

  const leagueQueryResult = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      participants: { // This now includes the PlayerLeagueStats records
        include: {
          player: {   // From within stats, include the actual player's info
            select: {
              name: true,
              id: true,
            },
          },
        },
        orderBy: [    // Order by the stats fields within PlayerLeagueStats
          { points: 'desc' },
          { roundDifferential: 'desc' },
          { gamesWon: 'desc' },
        ],
        select: {
          id: true, name: true, points: true, matchWins: true, matchLosses: true,
          matchDraws: true, gamesWon: true, gamesLost: true, totalRoundsWon: true,
          totalRoundsLost: true, roundDifferential: true,
        }
      },
      matches: {
        include: {
          homePlayer: true,
          awayPlayer: true,
          games: true,
        },
        orderBy: { day: 'asc' },
      },
    },
  });

  if (!leagueQueryResult) {
    notFound();
  }

  const leagueParticipants: DataTableParticipant[] = leagueQueryResult.participants.map(p => ({
    id: p.id,
    name: p.name,
    points: p.points,
    wins: p.matchWins,
    losses: p.matchLosses,
    draws: p.matchDraws,
    gamesWon: p.gamesWon,
    gamesLost: p.gamesLost,
    totalRoundsWon: p.totalRoundsWon,
    totalRoundsLost: p.totalRoundsLost,
    roundDifferential: p.roundDifferential,
  }));


  // =========================================================================
  // UPDATED DATA MAPPING FOR MATCH LIST
  // This transformation creates the object shape that MatchList expects
  // =========================================================================
  const transformedMatches = leagueQueryResult.matches.map(match => {
    const game1Data = match.games.find(g => g.gameNumber === 1);
    const game2Data = match.games.find(g => g.gameNumber === 2);
    const defaultGameDetails: GameDetails = { winnerId: null, loserId: null, winnerRounds: 0, loserRounds: 0 };

    // This logic correctly calculates match scores
    let p1Score = 0;
    let p2Score = 0;
    if (match.isCompleted) {
        if (match.homePlayerMatchPoints === 3) p1Score = 2;
        if (match.awayPlayerMatchPoints === 3) p2Score = 2;
        if (match.homePlayerMatchPoints === 1) { p1Score = 1; p2Score = 1; }
    }

    return {
      ...match,
      player1: match.homePlayer, // Pass the full homePlayer object
      player2: match.awayPlayer, // Pass the full awayPlayer object
      day: match.day || 1,
      player1Score: p1Score,
      player2Score: p2Score,
      game1: game1Data ? {
        winnerId: game1Data.winnerId,
        loserId: game1Data.loserId,
        winnerRounds: game1Data.winnerRounds,
        loserRounds: game1Data.loserRounds,
      } : defaultGameDetails,
      game2: game2Data ? {
        winnerId: game2Data.winnerId,
        loserId: game2Data.loserId,
        winnerRounds: game2Data.winnerRounds,
        loserRounds: game2Data.loserRounds,
      } : defaultGameDetails,
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
        {/* Now you pass the correctly shaped data to MatchList */}
        <MatchList matches={transformedMatches} leagueId={leagueId} />
      </div>
    </div>
  );
}