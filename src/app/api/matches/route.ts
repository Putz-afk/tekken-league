// app/api/matches/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Player as PrismaPlayer, Match as PrismaMatch, Game as PrismaGame } from '@prisma/client';

const prisma = new PrismaClient(); // Global Prisma client instance

// Helper function to recalculate and update a player's statistics
// NOW ACCEPTS THE TRANSACTION CLIENT (tx) AS AN ARGUMENT
async function updatePlayerStats(playerId: string, tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) {
  console.log(`--- Starting updatePlayerStats for Player ID: ${playerId} ---`);

  // Use tx for database operations within the transaction
  const player = await tx.player.findUnique({ where: { id: playerId } });
  if (!player) {
    console.error(`ERROR in updatePlayerStats: Player with ID ${playerId} not found.`);
    return;
  }
  console.log(`Player found for update: ${player.name}`);

  let newPoints = 0;
  let newMatchWins = 0;
  let newMatchLosses = 0;
  let newMatchDraws = 0;
  let newGamesWon = 0;
  let newGamesLost = 0;
  let newTotalRoundsWon = 0;
  let newTotalRoundsLost = 0;

  // Fetch all completed matches where this player was involved
  // NOW USING tx.match.findMany
  const playerMatches = await tx.match.findMany({
    where: {
      OR: [
        { homePlayerId: playerId },
        { awayPlayerId: playerId }
      ],
      isCompleted: true // Ensure only completed matches are counted
    },
    include: {
      games: true // Include individual game results
    }
  });

  console.log(`For ${player.name} (ID: ${playerId}): Found ${playerMatches.length} completed matches.`);

  for (const match of playerMatches) {
    console.log(`  Processing Match ID: ${match.id} (Home: ${match.homePlayerId}, Away: ${match.awayPlayerId})`);
    
    // Accumulate match points and match W/L/D
    if (match.homePlayerId === playerId) {
      newPoints += match.homePlayerMatchPoints;
      if (match.homePlayerMatchPoints === 3) newMatchWins++;
      else if (match.homePlayerMatchPoints === 1) newMatchDraws++;
      else if (match.homePlayerMatchPoints === 0) newMatchLosses++;
      console.log(`    - Player is home. Match points: ${match.homePlayerMatchPoints}`);
    } else if (match.awayPlayerId === playerId) {
      newPoints += match.awayPlayerMatchPoints;
      if (match.awayPlayerMatchPoints === 3) newMatchWins++;
      else if (match.awayPlayerMatchPoints === 1) newMatchDraws++;
      else if (match.awayPlayerMatchPoints === 0) newMatchLosses++;
      console.log(`    - Player is away. Match points: ${match.awayPlayerMatchPoints}`);
    }

    // Accumulate individual game and round stats
    console.log(`  - This match has ${match.games.length} games.`);
    for (const game of match.games) {
      console.log(`    - Game ID: ${game.id}, Winner: ${game.winnerId} (${game.winnerRounds}-${game.loserRounds})`);
      if (game.winnerId === playerId) {
        newGamesWon++;
        newTotalRoundsWon += game.winnerRounds;
        newTotalRoundsLost += game.loserRounds;
        console.log(`      - Player ${player.name} WON this game. Current GW: ${newGamesWon}, TRW: ${newTotalRoundsWon}, TRL: ${newTotalRoundsLost}`);
      } else if (game.loserId === playerId) {
        newGamesLost++;
        newTotalRoundsWon += game.loserRounds;
        newTotalRoundsLost += game.winnerRounds;
        console.log(`      - Player ${player.name} LOST this game. Current GL: ${newGamesLost}, TRW: ${newTotalRoundsWon}, TRL: ${newTotalRoundsLost}`);
      } else {
        console.log(`      - WARNING: Game winner/loser (${game.winnerId}/${game.loserId}) does not match player ${playerId} for Game ID ${game.id}. This game won't count for stats.`);
      }
    }
  }

  const finalRoundDifferential = newTotalRoundsWon - newTotalRoundsLost;

  console.log(`--- Final calculated stats for ${player.name} (ID: ${playerId}): ---`);
  console.log(`  Points: ${newPoints}`);
  console.log(`  Match Wins: ${newMatchWins}, Losses: ${newMatchLosses}, Draws: ${newMatchDraws}`);
  console.log(`  Games Won: ${newGamesWon}, Games Lost: ${newGamesLost}`);
  console.log(`  Total Rounds Won: ${newTotalRoundsWon}, Total Rounds Lost: ${newTotalRoundsLost}`);
  console.log(`  Round Differential: ${finalRoundDifferential}`);

  try {
    // NOW USING tx.player.update
    const updatedPlayer = await tx.player.update({
      where: { id: playerId },
      data: {
        points: newPoints,
        matchWins: newMatchWins,
        matchLosses: newMatchLosses,
        matchDraws: newMatchDraws,
        gamesWon: newGamesWon,
        gamesLost: newGamesLost,
        totalRoundsWon: newTotalRoundsWon,
        totalRoundsLost: newTotalRoundsLost,
        roundDifferential: finalRoundDifferential,
      },
    });
    console.log(`--- Successfully persisted stats for player ${updatedPlayer.name} (ID: ${updatedPlayer.id}) ---`);
  } catch (updateError) {
    console.error(`!!! CRITICAL ERROR: Failed to update player ${player.name} (ID: ${playerId}) in DB:`, updateError);
  }
}

export async function POST(req: Request) {
  try {
    const {
      matchId,
      game1WinnerId,
      game1WinnerRounds,
      game1LoserRounds,
      game2WinnerId,
      game2WinnerRounds,
      game2LoserRounds,
    } = await req.json();

    console.log('Received match submission data:', { matchId, game1WinnerId, game2WinnerId });

    if (!matchId || !game1WinnerId || !game2WinnerId) {
      return NextResponse.json({ message: 'Missing required match or game winner IDs' }, { status: 400 });
    }

    // Fetch existing match and players *before* the transaction
    const existingMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: { homePlayer: true, awayPlayer: true }
    });

    if (!existingMatch) {
      console.error(`Match ID ${matchId} not found in DB.`);
      return NextResponse.json({ message: 'Match not found.' }, { status: 404 });
    }

    const { homePlayer, awayPlayer } = existingMatch;
    console.log(`Match found: ${homePlayer.name} vs ${awayPlayer.name}.`);

    if (![homePlayer.id, awayPlayer.id].includes(game1WinnerId) ||
        ![homePlayer.id, awayPlayer.id].includes(game2WinnerId)) {
        console.error('Invalid winner ID in submission.');
        return NextResponse.json({ message: 'Invalid winner ID for game 1 or game 2. Must be one of the match players.' }, { status: 400 });
    }

    let homePlayerMatchPoints = 0;
    let awayPlayerMatchPoints = 0;

    const homePlayerWonGame1 = (game1WinnerId === homePlayer.id);
    const homePlayerWonGame2 = (game2WinnerId === homePlayer.id);

    if (homePlayerWonGame1 && homePlayerWonGame2) {
      homePlayerMatchPoints = 3;
      awayPlayerMatchPoints = 0;
      console.log('Match result: Home Player (2-0)');
    } else if (!homePlayerWonGame1 && !homePlayerWonGame2) {
      homePlayerMatchPoints = 0;
      awayPlayerMatchPoints = 3;
      console.log('Match result: Away Player (2-0)');
    } else {
      homePlayerMatchPoints = 1;
      awayPlayerMatchPoints = 1;
      console.log('Match result: 1-1 Draw');
    }

    const transactionResult = await prisma.$transaction(async (tx) => {
      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          homePlayerMatchPoints,
          awayPlayerMatchPoints,
          isCompleted: true,
        },
      });
      console.log(`Match ${matchId} updated to completed within transaction.`);

      await tx.game.upsert({
        where: { matchId_gameNumber: { matchId: updatedMatch.id, gameNumber: 1 } },
        update: {
          winnerId: game1WinnerId,
          loserId: (game1WinnerId === homePlayer.id) ? awayPlayer.id : homePlayer.id,
          winnerRounds: game1WinnerRounds,
          loserRounds: game1LoserRounds,
        },
        create: {
          matchId: updatedMatch.id,
          gameNumber: 1,
          winnerId: game1WinnerId,
          loserId: (game1WinnerId === homePlayer.id) ? awayPlayer.id : homePlayer.id,
          winnerRounds: game1WinnerRounds,
          loserRounds: game1LoserRounds,
        },
      });
      console.log(`Game 1 for match ${matchId} upserted within transaction.`);

      await tx.game.upsert({
        where: { matchId_gameNumber: { matchId: updatedMatch.id, gameNumber: 2 } },
        update: {
          winnerId: game2WinnerId,
          loserId: (game2WinnerId === homePlayer.id) ? awayPlayer.id : homePlayer.id,
          winnerRounds: game2WinnerRounds,
          loserRounds: game2LoserRounds,
        },
        create: {
          matchId: updatedMatch.id,
          gameNumber: 2,
          winnerId: game2WinnerId,
          loserId: (game2WinnerId === homePlayer.id) ? awayPlayer.id : homePlayer.id,
          winnerRounds: game2WinnerRounds,
          loserRounds: game2LoserRounds,
        },
      });
      console.log(`Game 2 for match ${matchId} upserted within transaction.`);

      // PASS THE TRANSACTION CLIENT (tx) TO updatePlayerStats
      await updatePlayerStats(homePlayer.id, tx); // <--- IMPORTANT CHANGE
      await updatePlayerStats(awayPlayer.id, tx); // <--- IMPORTANT CHANGE

      return updatedMatch;
    });

    console.log('Transaction completed successfully. Stats should be updated now.');
    return NextResponse.json({ message: 'Match result submitted successfully', match: transactionResult }, { status: 200 });

  } catch (error) {
    console.error('Error submitting match result:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  } finally {
    // If you have a global prisma client, removing this is generally better
    // as it can cause issues with subsequent requests if connections are closed prematurely.
    // await prisma.$disconnect();
  }
}