// src/app/api/matches/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

async function recalculatePlayerStatsForLeague(playerId: string, leagueId: string, tx: any) {
  const matches = await tx.match.findMany({
    where: {
      leagueId: leagueId,
      isCompleted: true,
      OR: [{ homePlayerId: playerId }, { awayPlayerId: playerId }],
    },
    include: { games: true },
  });

  let points = 0;
  let matchWins = 0;
  let matchLosses = 0;
  let matchDraws = 0;
  let gamesWon = 0;
  let gamesLost = 0;
  let totalRoundsWon = 0;
  let totalRoundsLost = 0;

  for (const match of matches) {
    const isHomePlayer = match.homePlayerId === playerId;

    if (isHomePlayer) {
      points += match.homePlayerMatchPoints;
      if (match.homePlayerMatchPoints === 3) matchWins++;
      else if (match.homePlayerMatchPoints === 1) matchDraws++;
      else if (match.homePlayerMatchPoints === 0) matchLosses++;
    } else {
      points += match.awayPlayerMatchPoints;
      if (match.awayPlayerMatchPoints === 3) matchWins++;
      else if (match.awayPlayerMatchPoints === 1) matchDraws++;
      else if (match.awayPlayerMatchPoints === 0) matchLosses++;
    }

    for (const game of match.games) {
      if (game.winnerId === playerId) {
        gamesWon++;
        totalRoundsWon += game.winnerRounds;
        totalRoundsLost += game.loserRounds;
      } else if (game.loserId === playerId) {
        gamesLost++;
        totalRoundsWon += game.loserRounds;
        totalRoundsLost += game.winnerRounds;
      }
    }
  }

  await tx.playerLeagueStats.update({
    where: {
      playerId_leagueId: {
        playerId,
        leagueId,
      },
    },
    data: {
      points,
      matchWins,
      matchLosses,
      matchDraws,
      gamesWon,
      gamesLost,
      totalRoundsWon,
      totalRoundsLost,
      roundDifferential: totalRoundsWon - totalRoundsLost,
    },
  });
}

export async function POST(req: Request) {
  try {
    const {
      matchId,
      leagueId,
      game1WinnerId,
      game1WinnerRounds,
      game1LoserRounds,
      game2WinnerId,
      game2WinnerRounds,
      game2LoserRounds,
    } = await req.json();

    if (!matchId || !leagueId || !game1WinnerId || !game2WinnerId) {
      return NextResponse.json({ message: 'Missing required IDs' }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json({ message: 'Match not found.' }, { status: 404 });
    }
    const { homePlayerId, awayPlayerId } = match;

    let homePlayerMatchPoints = 0;
    let awayPlayerMatchPoints = 0;

    if (game1WinnerId === homePlayerId && game2WinnerId === homePlayerId) {
      homePlayerMatchPoints = 3;
    } else if (game1WinnerId === awayPlayerId && game2WinnerId === awayPlayerId) {
      awayPlayerMatchPoints = 3;
    } else {
      homePlayerMatchPoints = 1;
      awayPlayerMatchPoints = 1;
    }

    const transactionResult = await prisma.$transaction(async (tx) => {
      await tx.match.update({
        where: { id: matchId },
        data: {
          homePlayerMatchPoints,
          awayPlayerMatchPoints,
          isCompleted: true,
        },
      });

      await tx.game.upsert({
        where: { matchId_gameNumber: { matchId, gameNumber: 1 } },
        update: { winnerId: game1WinnerId, loserId: game1WinnerId === homePlayerId ? awayPlayerId : homePlayerId, winnerRounds: game1WinnerRounds, loserRounds: game1LoserRounds },
        create: { matchId, gameNumber: 1, winnerId: game1WinnerId, loserId: game1WinnerId === homePlayerId ? awayPlayerId : homePlayerId, winnerRounds: game1WinnerRounds, loserRounds: game1LoserRounds },
      });

      await tx.game.upsert({
        where: { matchId_gameNumber: { matchId, gameNumber: 2 } },
        update: { winnerId: game2WinnerId, loserId: game2WinnerId === homePlayerId ? awayPlayerId : homePlayerId, winnerRounds: game2WinnerRounds, loserRounds: game2LoserRounds },
        create: { matchId, gameNumber: 2, winnerId: game2WinnerId, loserId: game2WinnerId === homePlayerId ? awayPlayerId : homePlayerId, winnerRounds: game2WinnerRounds, loserRounds: game2LoserRounds },
      });

      await recalculatePlayerStatsForLeague(homePlayerId, leagueId, tx);
      await recalculatePlayerStatsForLeague(awayPlayerId, leagueId, tx);
    });

    return NextResponse.json({ message: 'Match result submitted successfully', match: transactionResult }, { status: 200 });

  } catch (error) {
    console.error('Error submitting match result:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}