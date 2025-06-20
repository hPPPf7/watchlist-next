'use client';
import Image from 'next/image';
import type { Friend } from '@/types/Friend';

interface Props {
  friends: Friend[];
  value: string[];
  onChange: (v: string[]) => void;
}

export function FriendSelect({ friends, value, onChange }: Props) {
  function toggle(uid: string) {
    if (value.includes(uid)) {
      onChange(value.filter((id) => id !== uid));
    } else {
      onChange([...value, uid]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {friends.map((f) => (
        <label key={f.uid} className="flex cursor-pointer items-center gap-1 text-sm text-zinc-300">
          <input
            type="checkbox"
            className="accent-green-500"
            checked={value.includes(f.uid)}
            onChange={() => toggle(f.uid)}
          />
          {f.avatar && (
            <Image
              src={f.avatar}
              alt={f.nickname}
              width={24}
              height={24}
              className="rounded-full"
            />
          )}
          <span>{f.nickname}</span>
        </label>
      ))}
    </div>
  );
}
