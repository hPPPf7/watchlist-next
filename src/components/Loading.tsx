'use client';

export function Loading() {
  return (
    <div className="flex h-16 w-full items-center justify-center border-b border-zinc-700 bg-zinc-900">
      <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
    </div>
  );
}
