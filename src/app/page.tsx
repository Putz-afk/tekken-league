// src/app/page.tsx
import Link from 'next/link';
import CreateLeagueForm from '@/components/CreateLeagueForm';
import prisma from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function HomePage() {
  const leagues = await prisma.league.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-bold mb-4 text-yellow-400">Tekken League Tracker</h1>
        <p className="text-slate-300">Create a new league or view existing ones.</p>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Create a New League</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateLeagueForm />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Existing Leagues</CardTitle>
            </CardHeader>
            <CardContent>
              {leagues.length === 0 ? (
                <p className="text-slate-400">No leagues found. Create one to get started!</p>
              ) : (
                <ul className="space-y-2">
                  {leagues.map((league) => (
                    <li key={league.id}>
                      <Link href={`/league/${league.id}`} className="block p-3 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors">
                        {league.name}
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