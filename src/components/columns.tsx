// components/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type must exactly match the data shape you pass to the DataTable
// and the fields fetched from your Player model.
export type Participant = {
  id: string
  name: string
  points: number
  wins: number          // Maps to Prisma's 'matchWins'
  losses: number        // Maps to Prisma's 'matchLosses'
  draws: number         // Maps to Prisma's 'matchDraws'
  gamesWon: number
  gamesLost: number
  totalRoundsWon: number
  totalRoundsLost: number
  roundDifferential: number
}

export const columns: ColumnDef<Participant>[] = [
  {
    accessorKey: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    size: 50,
  },
  {
    accessorKey: "name",
    header: "Player",
    cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>,
  },
  {
    accessorKey: "points",
    header: () => <div className="text-center">Pts</div>,
    cell: ({ row }) => <div className="text-center font-bold text-yellow-400">{row.original.points}</div>,
    size: 60,
  },
  {
    accessorKey: "wins",
    header: () => <div className="text-center">MW</div>, // Match Wins (2-0)
    cell: ({ row }) => <div className="text-center text-green-400">{row.original.wins}</div>,
    size: 60,
  },
  {
    accessorKey: "losses",
    header: () => <div className="text-center">ML</div>, // Match Losses (0-2)
    cell: ({ row }) => <div className="text-center text-red-400">{row.original.losses}</div>,
    size: 60,
  },
  {
    accessorKey: "draws",
    header: () => <div className="text-center">MD</div>, // Match Draws (1-1)
    cell: ({ row }) => <div className="text-center">{row.original.draws}</div>,
    size: 60,
  },
  {
    accessorKey: "gamesWon",
    header: () => <div className="text-center">GW</div>, // Games Won
    cell: ({ row }) => <div className="text-center">{row.original.gamesWon}</div>,
    size: 60,
  },
  {
    accessorKey: "gamesLost",
    header: () => <div className="text-center">GL</div>, // Games Lost
    cell: ({ row }) => <div className="text-center">{row.original.gamesLost}</div>,
    size: 60,
  },
  {
    accessorKey: "totalRoundsWon",
    header: () => <div className="text-center">TRW</div>, // Total Rounds Won
    cell: ({ row }) => <div className="text-center">{row.original.totalRoundsWon}</div>,
    size: 70,
  },
  {
    accessorKey: "totalRoundsLost",
    header: () => <div className="text-center">TRL</div>, // Total Rounds Lost
    cell: ({ row }) => <div className="text-center">{row.original.totalRoundsLost}</div>,
    size: 70,
  },
  {
    accessorKey: "roundDifferential",
    header: () => <div className="text-center">RD</div>, // Round Differential
    cell: ({ row }) => {
      const differential = row.original.roundDifferential;
      const textColor = differential > 0 ? "text-green-400" : differential < 0 ? "text-red-400" : "text-slate-400";
      return <div className={`text-center font-bold ${textColor}`}>{differential}</div>;
    },
    size: 70,
  },
]