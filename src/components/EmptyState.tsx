// src/components/EmptyState.tsx
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type EmptyStateProps = {
  text: string;
  loading?: boolean;
  small?: boolean;
};

export function EmptyState({ text, loading, small }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col justify-center items-center text-gray-400',
        small ? 'h-20 text-sm' : 'h-40 text-base',
      )}
    >
      {loading && <Loader2 className="mb-2 size-6 animate-spin" />}
      {text}
    </div>
  );
}
