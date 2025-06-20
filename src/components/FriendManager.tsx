'use client';
import { useState } from 'react';
import { useFriends } from '@/hooks/useFriends';
import { addFriendByEmail, findUserByEmail, removeFriend } from '@/lib/friends';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { toast } from 'sonner';

export function FriendManager() {
  const { friends, reload } = useFriends();
  const [email, setEmail] = useState('');
  const [candidate, setCandidate] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!email.trim()) {
      setCandidate(null);
      return;
    }
    try {
      const result = await findUserByEmail(email.trim());
      setCandidate(result);
      if (!result) {
        toast.error('找不到用戶');
      }
    } catch (err) {
      console.error('查詢失敗', err);
      toast.error('查詢失敗');
      setCandidate(null);
    }
  }

  async function handleAdd() {
    if (!candidate) return;
    setLoading(true);
    try {
      await addFriendByEmail(email.trim());
      toast.success('已新增朋友');
      setEmail('');
      setCandidate(null);
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
    <Card className="border-zinc-700 bg-zinc-900 text-white">
      <CardHeader>
        <CardTitle>朋友管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="輸入 Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={search}
            className="flex-1"
          />
          <Button
            onClick={handleAdd}
            disabled={loading || !candidate}
            className="whitespace-nowrap"
          >
            新增
          </Button>
        </div>
        {candidate && (
          <div className="flex items-center gap-2 rounded bg-zinc-800 p-2">
            {(candidate.avatar || candidate.photoURL) && (
              <div className="relative size-8 shrink-0">
                <ImageWithFallback
                  src={candidate.avatar || candidate.photoURL}
                  alt="頭像"
                  className="rounded-full"
                />
              </div>
            )}
            <span className="truncate">{candidate.email}</span>
          </div>
        )}
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
                      <ImageWithFallback src={f.avatar} alt={f.nickname} className="rounded-full" />
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
  );
}
