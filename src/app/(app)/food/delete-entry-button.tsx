'use client';

import { X } from 'lucide-react';
import { useTransition } from 'react';
import { deleteFoodEntry } from './actions';

export function DeleteEntryButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => { await deleteFoodEntry(id); })}
      className="text-ink-muted hover:text-red-600 p-2 -mr-2 disabled:opacity-40"
      aria-label="Delete entry"
    >
      <X className="w-4 h-4" />
    </button>
  );
}
