// src/app/league/[leagueId]/page.tsx

import StandingsTable from "@/components/StandingsTable";
import MatchList from "@/components/MatchList";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";


export default async function LeaguePage({ params }: { params: Promise<{ leagueId: string }> }) {
  const { leagueId } = await params;

  const league = await prisma.league.findUnique({
    where: { id: leagueId }, // Using the destructured leagueId
    include: {
      participants: {
        orderBy: [
          { points: 'desc' },
          { wins: 'desc' },
          { name: 'asc' }
        ],
      },
      matches: {
        include: {
          player1: true,
          player2: true,
        },
        orderBy: { day: 'asc' },
      },
    },
  });

  if (!league) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="flex items-center gap-2 text-sm text-yellow-400 hover:underline mb-4">
            <FaArrowLeft /> Back to All Leagues
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight">{league.name}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Standings</h2>
          <StandingsTable participants={league.participants} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Match Schedule</h2>
          <MatchList matches={league.matches} leagueId={league.id} />
        </div>
      </div>
    </div>
  );
}