// src/components/CreateLeagueForm.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createLeague } from '@/lib/actions';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

const initialState = { success: false, message: '' }; // Match the FormState type

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending}>
      {pending ? 'Creating League...' : 'Create League'}
    </Button>
  );
}

export default function CreateLeagueForm() {
  // Use useFormState instead of useActionState
  const [state, formAction] = useActionState(createLeague, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="leagueName">League Name</Label>
        <Input id="leagueName" name="leagueName" placeholder="e.g., Weekend Warriors Season 1" required />
      </div>
      <div>
        <Label htmlFor="participants">Participants</Label>
        <Textarea
          id="participants"
          name="participants"
          placeholder="Enter one name per line..."
          rows={5}
          required
        />
      </div>
      <SubmitButton />
      {state.message && (
        <p aria-live="polite" className={`text-sm mt-2 ${state.success ? 'text-green-500' : 'text-red-500'}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}