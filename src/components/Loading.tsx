'use client';

export function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-16 bg-zinc-900 border-b border-zinc-700">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
