// src/components/MatchList.tsx
import { Match } from "@prisma/client";
import { MatchResultModal } from "./MatchResultModal";

import { Player } from "@prisma/client"; // Ensure Player is imported

// Re-define GameDetails here to ensure consistency
type GameDetails = {
  winnerId: string | null;
  loserId: string | null;
  winnerRounds: number;
  loserRounds: number;
};

// Define MatchWithPlayers to EXACTLY match MatchForMatchList from page.tsx
// It needs the properties that page.tsx adds in its transformation.
export type MatchWithPlayers = Match & {
  // Properties added by page.tsx transformation for MatchList
  player1: Player; // This is the transformed homePlayer
  player2: Player; // This is the transformed awayPlayer
  day: number; // The derived day
  player1Score: number; // The derived 2-0 or 1-1 matchup score
  player2Score: number; // The derived 2-0 or 1-1 matchup score
  game1: GameDetails; // Game 1 details for pre-filling modal
  game2: GameDetails; // Game 2 details for pre-filling modal

  // Also include the original Prisma fields if MatchList's internal logic uses them
  // For example, if MatchResultModal needs them directly (it probably does, but player1/2 are passed instead)
  // For safety, include homePlayer/awayPlayer from the original MatchForMatchList from page.tsx
  homePlayer: Player; // The original homePlayer from Prisma
  awayPlayer: Player; // The original awayPlayer from Prisma
};


type MatchListProps = {
  matches: MatchWithPlayers[]; // This now expects the fully transformed type
  leagueId: string;
};

export default function MatchList({ matches, leagueId }: MatchListProps) {
  const groupedMatches = matches.reduce((acc, match) => {
    const day = `Day ${match.day}`; // Uses the transformed 'day' field
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(match);
    return acc;
  }, {} as Record<string, MatchWithPlayers[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedMatches).map(([day, dayMatches]) => (
        <div key={day}>
          <h3 className="text-xl font-semibold mb-3 text-yellow-400">{day}</h3>
          <ul className="space-y-2">
            {dayMatches.map((match) => (
              <li key={match.id} className="bg-slate-800 p-3 rounded-md flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="font-medium w-32 text-right">{match.player1?.name || 'Unknown Player'}</span>
                  <span className="text-slate-400">vs</span>
                  <span className="font-medium w-32">{match.player2?.name || 'Unknown Player'}</span>
                </div>
                <div>
                  {match.isCompleted ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-slate-100">
                        {match.player1Score} - {match.player2Score}
                      </span>
                      {/* Pass the full match object (which includes game1, game2, player1, player2) to the modal */}
                      <MatchResultModal match={match} leagueId={leagueId} />
                    </div>
                  ) : (
                    <MatchResultModal match={match} leagueId={leagueId} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}