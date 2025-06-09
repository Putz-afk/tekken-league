// src/lib/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from './db';

// Type for form state to handle errors and messages
export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function createLeague(prevState: FormState, formData: FormData): Promise<FormState> {
  const leagueName = formData.get('leagueName') as string;
  const participantsStr = formData.get('participants') as string;

  if (!leagueName.trim() || !participantsStr.trim()) {
    return { message: 'Error: League Name and Participants cannot be empty.' };
  }

  const participantNames = participantsStr
    .split('\n')
    .map((name) => name.trim())
    .filter((name) => name);

  if (participantNames.length < 2) {
    return { message: 'Error: At least two participants are required.' };
  }

  // Round-robin scheduling requires an even number of players for this simple algorithm.
  // We add a "Bye" player if the count is odd.
  if (participantNames.length % 2 !== 0) {
    participantNames.push('Bye');
  }

  let newLeague;
  try {
    // Transaction to ensure all or nothing is created
    newLeague = await prisma.$transaction(async (tx) => {
      const league = await tx.league.create({
        data: { name: leagueName },
      });

      const participants = await Promise.all(
        participantNames.map((name) =>
          tx.participant.create({
            data: { name, leagueId: league.id },
          })
        )
      );

      // --- Round-Robin Scheduling Algorithm ---
      const numParticipants = participants.length;
      const rounds = numParticipants - 1;
      const matchesToCreate = [];

      for (let day = 0; day < rounds; day++) {
        for (let i = 0; i < numParticipants / 2; i++) {
          const p1 = participants[i];
          const p2 = participants[numParticipants - 1 - i];

          // Skip matches involving the "Bye" player
          if (p1.name === 'Bye' || p2.name === 'Bye') {
            continue;
          }

          matchesToCreate.push({
            day: day + 1,
            leagueId: league.id,
            player1Id: p1.id,
            player2Id: p2.id,
          });
        }
        // Rotate players for the next round, keeping the first player fixed
        const lastPlayer = participants.pop()!;
        participants.splice(1, 0, lastPlayer);
      }

      await tx.match.createMany({
        data: matchesToCreate,
      });
      
      return league;
    });
  } catch (error) {
    console.error('Failed to create league:', error);
    return { message: 'Database Error: Failed to create league.' };
  }

  revalidatePath('/'); // Refresh the homepage to show the new league
  redirect(`/league/${newLeague.id}`); // Navigate to the new league page
}


export async function updateMatchResult(prevState: FormState, formData: FormData): Promise<FormState> {
    const matchId = formData.get('matchId') as string;
    const player1Id = formData.get('player1Id') as string;
    const player2Id = formData.get('player2Id') as string;
    const player1ScoreStr = formData.get('player1Score') as string;
    const player2ScoreStr = formData.get('player2Score') as string;
    const leagueId = formData.get('leagueId') as string;

    const player1Score = parseInt(player1ScoreStr, 10);
    const player2Score = parseInt(player2ScoreStr, 10);

    // --- Validation ---
    if (isNaN(player1Score) || isNaN(player2Score)) {
        return { message: 'Scores must be numbers.' };
    }
    if (player1Score < 0 || player2Score < 0 || (player1Score + player2Score) > 3) {
        return { message: 'Invalid score total. Must be Bo3.' };
    }
    if (player1Score === player2Score || (player1Score < 2 && player2Score < 2)) {
        return { message: 'Invalid result. One player must win 2 games.' };
    }

    const winnerId = player1Score > player2Score ? player1Id : player2Id;
    const loserId = player1Score < player2Score ? player1Id : player2Id;

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update Match
            await tx.match.update({
                where: { id: matchId },
                data: {
                    isCompleted: true,
                    player1Score,
                    player2Score,
                },
            });

            // 2. Update Winner's stats
            await tx.participant.update({
                where: { id: winnerId },
                data: {
                    matchesPlayed: { increment: 1 },
                    wins: { increment: 1 },
                    points: { increment: 3 }, // 3 points for a win
                    gamesWon: { increment: Math.max(player1Score, player2Score) },
                    gamesLost: { increment: Math.min(player1Score, player2Score) },
                },
            });

            // 3. Update Loser's stats
            await tx.participant.update({
                where: { id: loserId },
                data: {
                    matchesPlayed: { increment: 1 },
                    losses: { increment: 1 },
                    gamesWon: { increment: Math.min(player1Score, player2Score) },
                    gamesLost: { increment: Math.max(player1Score, player2Score) },
                },
            });
        });
    } catch (error) {
        console.error('Failed to update match:', error);
        return { message: 'Database Error: Failed to update match result.' };
    }

    revalidatePath(`/league/${leagueId}`);
    return { message: 'Match updated successfully!' };
}