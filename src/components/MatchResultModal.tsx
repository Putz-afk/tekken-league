// src/components/MatchResultModal.tsx
'use client';

import { useState, useEffect } from 'react'; // Import useEffect
import { useFormStatus } from 'react-dom';
import { Match, Player } from '@prisma/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { updateMatchResult } from '@/lib/actions';
import { FaEdit } from 'react-icons/fa';

// NEW TYPE: Represents a single game with its winner/loser/rounds details
type GameDetails = {
  winnerId: string | null;
  loserId: string | null;
  winnerRounds: number;
  loserRounds: number;
};

// Updated MatchWithPlayers type for MatchResultModal to include game1/game2
type MatchWithPlayers = Match & {
  player1: Player;
  player2: Player;
  game1: GameDetails; // Add game1 data
  game2: GameDetails; // Add game2 data
};

type MatchResultModalProps = {
  match: MatchWithPlayers;
  leagueId: string;
};

const initialState = { success: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending}>
      {pending ? 'Submitting...' : 'Save Result'}
    </Button>
  );
}

export function MatchResultModal({ match, leagueId }: MatchResultModalProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  // Local state to manage form values for controlled components, if needed
  // For simplicity, we'll rely on defaultValue for now, but for complex forms
  // you might convert to controlled components with useState.

  // Reset message when modal opens/closes
  useEffect(() => {
    if (!open) {
      setMessage(''); // Clear message when modal closes
    }
  }, [open]);
  
  const handleSubmit = async (formData: FormData) => {
    setMessage('');
    
    const player1Id = match.player1.id;
    const player2Id = match.player2.id;

    const game1Winner = formData.get('game1Winner') as string;
    const game2Winner = formData.get('game2Winner') as string;

    if (![player1Id, player2Id].includes(game1Winner) ||
        ![player1Id, player2Id].includes(game2Winner)) {
      setMessage('Invalid winner selected for one of the games. Please select either ' + match.player1.name + ' or ' + match.player2.name + '.');
      return;
    }

    const dataToSend = {
      matchId: match.id,
      leagueId: leagueId,
      game1WinnerId: game1Winner,
      game1WinnerRounds: parseInt(formData.get('game1WinnerRounds') as string, 10),
      game1LoserRounds: parseInt(formData.get('game1LoserRounds') as string, 10),
      game2WinnerId: game2Winner,
      game2WinnerRounds: parseInt(formData.get('game2WinnerRounds') as string, 10),
      game2LoserRounds: parseInt(formData.get('game2LoserRounds') as string, 10),
    };

    try {
      const result = await updateMatchResult(dataToSend);

      if (result.success) {
        setOpen(false);
      } else {
        setMessage(result.message || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error("Error submitting match result:", error);
      setMessage('Failed to update match result due to a network or server error.');
    }
  };

  // Determine button text and style based on match completion status
  const triggerButtonText = match.isCompleted ? 'Edit Result' : 'Record Result';
  const triggerButtonVariant = match.isCompleted ? 'outline' : 'default'; // default is usually primary/filled
  const triggerButtonClassName = match.isCompleted ? 'text-blue-400 hover:text-blue-300' : 'bg-green-600 hover:bg-green-700 text-white'; // Consistent styling

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerButtonVariant} size="sm" className={triggerButtonClassName}>
          <FaEdit className="mr-2 h-4 w-4" /> {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{match.isCompleted ? 'Edit Match Result' : 'Record Match Result'} for {match.player1.name} vs {match.player2.name}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-6 pt-4">
          <input type="hidden" name="matchId" value={match.id} />
          
          {/* Game 1 Inputs */}
          <div className="space-y-2 border-b pb-4 border-slate-700">
            <h4 className="text-lg font-semibold text-slate-200">Game 1 (Best of 5 Rounds)</h4>
            <div className="flex flex-col gap-2">
              <Label htmlFor="game1Winner" className="text-slate-400">Winner</Label>
              <select 
                id="game1Winner" 
                name="game1Winner" 
                required 
                className="block w-full p-2 border border-slate-600 rounded-md bg-slate-800 text-slate-100"
                defaultValue={match.game1.winnerId || ""} // Pre-fill winner if available
              >
                <option value="">Select Winner</option>
                <option value={match.player1.id}>{match.player1.name}</option>
                <option value={match.player2.id}>{match.player2.name}</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="game1WinnerRounds" className="text-slate-400 w-1/2 text-right">Winner Rounds (3-5)</Label>
              <Input 
                id="game1WinnerRounds" 
                name="game1WinnerRounds" 
                type="number" 
                min="3" max="3" 
                required 
                className="w-1/2 text-center bg-slate-800 text-slate-100 border-slate-600" 
                defaultValue={match.game1.winnerRounds > 0 ? match.game1.winnerRounds : 3} // Pre-fill rounds, default to 3
              />
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="game1LoserRounds" className="text-slate-400 w-1/2 text-right">Loser Rounds (0-2)</Label>
              <Input 
                id="game1LoserRounds" 
                name="game1LoserRounds" 
                type="number" 
                min="0" max="2" 
                required 
                className="w-1/2 text-center bg-slate-800 text-slate-100 border-slate-600" 
                defaultValue={match.game1.loserRounds} // Pre-fill rounds
              />
            </div>
          </div>

          {/* Game 2 Inputs */}
          <div className="space-y-2 border-b pb-4 border-slate-700">
            <h4 className="text-lg font-semibold text-slate-200">Game 2 (Best of 5 Rounds)</h4>
            <div className="flex flex-col gap-2">
              <Label htmlFor="game2Winner" className="text-slate-400">Winner</Label>
              <select 
                id="game2Winner" 
                name="game2Winner" 
                required 
                className="block w-full p-2 border border-slate-600 rounded-md bg-slate-800 text-slate-100"
                defaultValue={match.game2.winnerId || ""} // Pre-fill winner if available
              >
                <option value="">Select Winner</option>
                <option value={match.player1.id}>{match.player1.name}</option>
                <option value={match.player2.id}>{match.player2.name}</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="game2WinnerRounds" className="text-slate-400 w-1/2 text-right">Winner Rounds (3-5)</Label>
              <Input 
                id="game2WinnerRounds" 
                name="game2WinnerRounds" 
                type="number" 
                min="3" max="3" 
                required 
                className="w-1/2 text-center bg-slate-800 text-slate-100 border-slate-600" 
                defaultValue={match.game2.winnerRounds > 0 ? match.game2.winnerRounds : 3} // Pre-fill rounds, default to 3
              />
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="game2LoserRounds" className="text-slate-400 w-1/2 text-right">Loser Rounds (0-2)</Label>
              <Input 
                id="game2LoserRounds" 
                name="game2LoserRounds" 
                type="number" 
                min="0" max="2" 
                required 
                className="w-1/2 text-center bg-slate-800 text-slate-100 border-slate-600" 
                defaultValue={match.game2.loserRounds} // Pre-fill rounds
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <SubmitButton />
          </div>
          {message && (
             <p aria-live="polite" className="text-sm text-red-500 mt-2">{message}</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}