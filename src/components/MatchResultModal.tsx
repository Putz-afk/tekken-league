// src/components/MatchResultModal.tsx
'use client';

// 1. Import 'useActionState' from 'react'
import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Match, Participant } from '@prisma/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { updateMatchResult } from '@/lib/actions';
import { FaEdit } from 'react-icons/fa';

type MatchWithPlayers = Match & {
  player1: Participant;
  player2: Participant;
};

type MatchResultModalProps = {
  match: MatchWithPlayers;
  leagueId: string;
};

const initialState = { message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending}>
      {pending ? 'Saving...' : 'Save Result'}
    </Button>
  );
}

export function MatchResultModal({ match, leagueId }: MatchResultModalProps) {
  const [open, setOpen] = useState(false);
  
  // 2. Rename the hook to useActionState
  const [state, formAction] = useActionState(updateMatchResult, initialState);

  // A more reliable way to close the dialog
  if (state.message === 'Match updated successfully!' && open) {
    setOpen(false);
    state.message = ''; // Reset message to prevent re-triggering
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FaEdit className="mr-2 h-4 w-4" /> Record Result
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Match Result</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4 pt-4">
          <input type="hidden" name="matchId" value={match.id} />
          <input type="hidden" name="player1Id" value={match.player1Id} />
          <input type="hidden" name="player2Id" value={match.player2Id} />
          <input type="hidden" name="leagueId" value={leagueId} />
          
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="p1score" className="text-right font-bold text-lg">
              {match.player1.name}
            </Label>
            <Input id="p1score" name="player1Score" type="number" min="0" max="2" required className="w-20 text-center" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="p2score" className="text-right font-bold text-lg">
              {match.player2.name}
            </Label>
            <Input id="p2score" name="player2Score" type="number" min="0" max="2" required className="w-20 text-center" />
          </div>

          <div className="flex justify-end">
            <SubmitButton />
          </div>
          {state?.message && state.message !== 'Match updated successfully!' && (
             <p aria-live="polite" className="text-sm text-red-500 mt-2">{state.message}</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}