// src/lib/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from './db';

// --- Type Definitions ---
export type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

// --- createLeague Action ---
export async function createLeague(prevState: FormState, formData: FormData): Promise<FormState> {
  // --- All your validation and "Bye" player logic is the same ---
  const leagueName = formData.get('leagueName') as string;
  const participantsStr = formData.get('participants') as string;
  if (!leagueName.trim() || !participantsStr.trim()) {
    return { success: false, message: 'Error: League Name and Participants cannot be empty.' };
  }
  const participantNames = participantsStr.split('\n').map(name => name.trim()).filter(name => name);
  if (participantNames.length < 2) {
    return { success: false, message: 'Error: At least two participants are required.' };
  }
  if (participantNames.length % 2 !== 0) {
    participantNames.push('Bye');
  }

  let newLeague;
  try {
    newLeague = await prisma.$transaction(async (tx) => {
      // Step 1: Find or create all the necessary players. This is still correct.
      const playerUpserts = participantNames.map((name) =>
        tx.player.upsert({
          where: { name: name },
          update: {},
          create: { name: name },
        })
      );
      const players = await Promise.all(playerUpserts);

      // Step 2: Create the league and its associated PlayerLeagueStats records
      const league = await tx.league.create({
        data: {
          name: leagueName,
          participants: {
            // =====================================================================
            // THE FIX IS HERE:
            // Instead of a nested connect, we directly provide the playerId.
            // =====================================================================
            create: players.map(player => ({
              playerId: player.id
            }))
          }
        }
      });

      // Step 3: Round-Robin Scheduling (works with NO CHANGES)
      const numPlayers = players.length;
      const rounds = numPlayers - 1;
      const matchesToCreate = [];
      const rotatingPlayers = [...players];
      for (let day = 0; day < rounds; day++) {
        for (let i = 0; i < numPlayers / 2; i++) {
          const p1 = rotatingPlayers[i];
          const p2 = rotatingPlayers[numPlayers - 1 - i];
          if (p1.name === 'Bye' || p2.name === 'Bye') continue;
          matchesToCreate.push({
            leagueId: league.id,
            homePlayerId: p1.id,
            awayPlayerId: p2.id,
            day: day + 1,
          });
        }
        if (numPlayers > 1) {
          const lastPlayer = rotatingPlayers.pop()!;
          rotatingPlayers.splice(1, 0, lastPlayer);
        }
      }

      if (matchesToCreate.length > 0) {
        await tx.match.createMany({ data: matchesToCreate });
      }

      return league;
    });
  } catch (error) {
    console.error('Failed to create league:', error);
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return { success: false, message: 'Error: A league with this name already exists.' };
    }
    return { success: false, message: 'Database Error: Failed to create league.' };
  }

  // Revalidation and Redirect
  revalidatePath('/');
  redirect(`/league/${newLeague.id}`);
}


// --- updateMatchResult Action ---
// This function does not need changes, but the API route it calls WILL need changes
// to update the new PlayerLeagueStats model instead of the Player model.
export async function updateMatchResult(
  data: {
    matchId: string;
    leagueId: string;
    game1WinnerId: string;
    game1WinnerRounds: number;
    game1LoserRounds: number;
    game2WinnerId: string;
    game2WinnerRounds: number;
    game2LoserRounds: number;
  }
): Promise<FormState> {
  try {
      if (!data.matchId || !data.game1WinnerId || !data.game2WinnerId ||
          isNaN(data.game1WinnerRounds) || isNaN(data.game1LoserRounds) ||
          isNaN(data.game2WinnerRounds) || isNaN(data.game2LoserRounds)) {
          return { success: false, message: 'Invalid or missing data for match result.' };
      }
      const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/matches`;
      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
          console.error('API Error Response:', result);
          return { success: false, message: result.message || 'Failed to record match result.' };
      }
      revalidatePath(`/league/${data.leagueId}`);
      revalidatePath('/api/standings');
      return { success: true, message: 'Match result recorded successfully!' };
  } catch (error) {
      console.error('Error in updateMatchResult action:', error);
      return { success: false, message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` };
  }
}