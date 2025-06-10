// app/api/standings/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all players, ordered by the specified tie-breaker rules
    const players = await prisma.player.findMany({
      where: {
        name: {
          not: 'Bye' // Exclude the "Bye" player from standings
        }
      },
      orderBy: [
        { points: 'desc' },            // Primary: Total Points
        { totalRoundsWon: 'desc' },    // Tie-breaker 1: Total Rounds Won
        { roundDifferential: 'desc' }, // Tie-breaker 2: Round Differential
        { gamesWon: 'desc' },          // Tie-breaker 3: Most Games Won
        { gamesLost: 'asc' },          // Tie-breaker 4: Least Games Lost
        { name: 'asc' }                // Final fallback: Alphabetical by name
      ],
      // We don't need a 'select' here as we're fetching all fields of the Player model
      // that are needed for the standings table.
    });

    return NextResponse.json(players, { status: 200 });

  } catch (error) {
    console.error('Error fetching standings:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}