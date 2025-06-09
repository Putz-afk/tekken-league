// src/components/StandingsTable.tsx
import { Participant } from '@prisma/client';
import { Card, CardContent } from './ui/card';

type StandingsTableProps = {
  participants: Participant[];
};

export default function StandingsTable({ participants }: StandingsTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-700 text-xs text-slate-300 uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">#</th>
                <th scope="col" className="px-4 py-3">Player</th>
                <th scope="col" className="px-4 py-3 text-center">Pts</th>
                <th scope="col" className="px-4 py-3 text-center">W</th>
                <th scope="col" className="px-4 py-3 text-center">L</th>
                <th scope="col" className="px-4 py-3 text-center">GW</th>
                <th scope="col" className="px-4 py-3 text-center">GL</th>
              </tr>
            </thead>
            <tbody>
              {participants
                .filter(p => p.name !== 'Bye') // Hide the "Bye" player from standings
                .map((p, index) => (
                <tr key={p.id} className="border-b border-slate-700 hover:bg-slate-800">
                  <td className="px-4 py-3 font-medium">{index + 1}</td>
                  <td className="px-4 py-3 font-semibold">{p.name}</td>
                  <td className="px-4 py-3 text-center font-bold text-yellow-400">{p.points}</td>
                  <td className="px-4 py-3 text-center text-green-400">{p.wins}</td>
                  <td className="px-4 py-3 text-center text-red-400">{p.losses}</td>
                  <td className="px-4 py-3 text-center">{p.gamesWon}</td>
                  <td className="px-4 py-3 text-center">{p.gamesLost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}