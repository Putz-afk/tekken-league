// src/components/MatchList.tsx
import { Match, Participant } from "@prisma/client";
import { MatchResultModal } from "./MatchResultModal";

type MatchWithPlayers = Match & {
  player1: Participant;
  player2: Participant;
};

type MatchListProps = {
  matches: MatchWithPlayers[];
  leagueId: string;
};

export default function MatchList({ matches, leagueId }: MatchListProps) {
  const groupedMatches = matches.reduce((acc, match) => {
    const day = `Day ${match.day}`;
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
                  <span className="font-medium w-32 text-right">{match.player1.name}</span>
                  <span className="text-slate-400">vs</span>
                  <span className="font-medium w-32">{match.player2.name}</span>
                </div>
                <div>
                  {match.isCompleted ? (
                    <span className="font-bold text-lg">
                      {match.player1Score} - {match.player2Score}
                    </span>
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