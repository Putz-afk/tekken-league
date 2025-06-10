// src/app/page.tsx
import Link from 'next/link';
import CreateLeagueForm from '@/components/CreateLeagueForm';
import prisma from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { League } from '@prisma/client';


export default async function HomePage() {
  const leagues = await prisma.league.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-12 text-slate-100">
      <section className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-4 text-yellow-400">Tekken League Tracker</h1>
          <p className="text-slate-300">Create a new league or view existing ones.</p>
        </div>
        {/* === ADD THIS LINK === */}
        <Link href="/rules" className="text-yellow-400 hover:underline font-semibold border border-yellow-500/50 rounded-md px-4 py-2 hover:bg-yellow-500/10 transition-colors">
          View League Rules
        </Link>
        {/* === END OF ADDED LINK === */}
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div>
          <Card className="bg-slate-800 border-slate-700 text-slate-100"> {/* Dark card background and border */}
            <CardHeader className="border-b border-slate-700"> {/* Header border */}
              <CardTitle className="text-yellow-400">Create a New League</CardTitle> {/* Yellow title */}
            </CardHeader>
            <CardContent className="pt-6"> {/* Add padding top for content within card */}
              <CreateLeagueForm />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="bg-slate-800 border-slate-700 text-slate-100"> {/* Dark card background and border */}
            <CardHeader className="border-b border-slate-700"> {/* Header border */}
              <CardTitle className="text-yellow-400">Existing Leagues</CardTitle> {/* Yellow title */}
            </CardHeader>
            <CardContent className="pt-6"> {/* Add padding top for content within card */}
              {leagues.length === 0 ? (
                <p className="text-slate-400">No leagues found. Create one to get started!</p>
              ) : (
                <ul className="space-y-3"> {/* Increased space between list items slightly */}
                  {leagues.map((league: League) => (
                    <li key={league.id}>
                      <Link 
                        href={`/league/${league.slug}`} 
                        className="block p-4 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors border border-transparent hover:border-yellow-500" // Added border and hover border
                      >
                        <h3 className="font-semibold text-lg text-slate-100">{league.name}</h3> {/* Consistent text color */}
                        {/* Optional: Add creation date if you want */}
                        {/* <p className="text-slate-400 text-sm mt-1">Created: {format(new Date(league.createdAt), 'MMM dd, yyyy')}</p> */}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}