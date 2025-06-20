'use client';
import { useState } from 'react';
import { useFriends } from '@/hooks/useFriends';
import { addFriend, removeFriend } from '@/lib/friends';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { toast } from 'sonner';

export default function FriendsPage() {
  const { friends, reload } = useFriends();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!value.trim()) return;
    setLoading(true);
    try {
      await addFriend(value.trim());
      toast.success('已新增朋友');
      setValue('');
      await reload();
    } catch (err) {
      console.error('新增朋友失敗', err);
      toast.error('新增失敗');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(uid: string) {
    if (!uid) return;
    setLoading(true);
    try {
      await removeFriend(uid);
      toast.success('已移除朋友');
      await reload();
    } catch (err) {
      console.error('移除朋友失敗', err);
      toast.error('移除失敗');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <Card className="border-zinc-700 bg-zinc-900 text-white">
        <CardHeader>
          <CardTitle>朋友管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="輸入 UID 或 Email"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAdd} disabled={loading} className="whitespace-nowrap">
              新增
            </Button>
          </div>
          {friends.length === 0 ? (
            <p className="text-sm text-zinc-400">目前沒有朋友</p>
          ) : (
            <ul className="space-y-2">
              {friends.map((f) => (
                <li
                  key={f.uid}
                  className="flex items-center justify-between gap-2 rounded bg-zinc-800 p-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {f.avatar && (
                      <div className="relative size-8 shrink-0">
                        <ImageWithFallback
                          src={f.avatar}
                          alt={f.nickname}
                          className="rounded-full"
                        />
                      </div>
                    )}
                    <span className="truncate">{f.nickname}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(f.uid)}
                    disabled={loading}
                  >
                    移除
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
