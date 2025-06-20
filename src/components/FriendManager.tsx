'use client';
import { useState, useEffect } from 'react';
import { useFriends } from '@/hooks/useFriends';
import { useFriendInvites } from '@/hooks/useFriendInvites';
import {
  sendFriendInvite,
  findUserByEmail,
  removeFriend,
  acceptFriendInvite,
  declineFriendInvite,
} from '@/lib/friends';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { toast } from 'sonner';

export function FriendManager() {
  const { friends, reload } = useFriends();
  const { invites, reload: reloadInvites } = useFriendInvites();
  const [email, setEmail] = useState('');
  const [candidate, setCandidate] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentInvites, setSentInvites] = useState<string[]>([]);
  const [sentInviteEmails, setSentInviteEmails] = useState<string[]>([]);

  // 讀取 localStorage 中保存的邀請紀錄
  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('sentInvites') || '[]');
      if (Array.isArray(ids)) setSentInvites(ids);
    } catch (err) {
      console.warn('failed to parse sentInvites', err);
    }
    try {
      const mails = JSON.parse(localStorage.getItem('sentInviteEmails') || '[]');
      if (Array.isArray(mails)) setSentInviteEmails(mails);
    } catch (err) {
      console.warn('failed to parse sentInviteEmails', err);
    }
  }, []);

  // 將邀請紀錄同步到 localStorage
  useEffect(() => {
    localStorage.setItem('sentInvites', JSON.stringify(sentInvites));
  }, [sentInvites]);

  useEffect(() => {
    localStorage.setItem('sentInviteEmails', JSON.stringify(sentInviteEmails));
  }, [sentInviteEmails]);

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

  async function handleInvite() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const targetId = candidate?.uid;
      await sendFriendInvite(email.trim());
      toast.success('邀請已發送');
      if (targetId) {
        setSentInvites((prev) => (prev.includes(targetId) ? prev : [...prev, targetId]));
      }
      setSentInviteEmails((prev) => {
        const mail = email.trim().toLowerCase();
        return prev.includes(mail) ? prev : [...prev, mail];
      });
      setEmail('');
      setCandidate(null);
      await reloadInvites();
    } catch (err) {
      console.error('發送邀請失敗', err);
      toast.error('邀請失敗');
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

  async function handleAccept(uid: string) {
    if (!uid) return;
    setLoading(true);
    try {
      await acceptFriendInvite(uid);
      toast.success('已新增朋友');
      await Promise.all([reload(), reloadInvites()]);
    } catch (err) {
      console.error('接受邀請失敗', err);
      toast.error('處理失敗');
    } finally {
      setLoading(false);
    }
  }

  async function handleDecline(uid: string) {
    if (!uid) return;
    setLoading(true);
    try {
      await declineFriendInvite(uid);
      toast.success('已拒絕邀請');
      await reloadInvites();
    } catch (err) {
      console.error('拒絕邀請失敗', err);
      toast.error('處理失敗');
    } finally {
      setLoading(false);
    }
  }

  const isFriend = candidate ? friends.some((f) => f.uid === candidate.uid) : false;
  const isInvited = candidate
    ? sentInvites.includes(candidate.uid) || sentInviteEmails.includes(email.trim().toLowerCase())
    : sentInviteEmails.includes(email.trim().toLowerCase());

  return (
    <Card className="w-full max-w-md border-zinc-700 bg-zinc-900 text-white">
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
            onClick={handleInvite}
            disabled={loading || !email.trim() || isFriend || isInvited}
            className="whitespace-nowrap"
          >
            {isFriend ? '已是朋友' : isInvited ? '已發送邀請' : '發送邀請'}
          </Button>
        </div>
        {candidate && (
          <div className="flex items-center gap-2 rounded bg-zinc-800 p-2">
            {(candidate.avatar || candidate.photoURL) && (
              <div className="relative size-8 shrink-0">
                <ImageWithFallback
                  src={candidate.avatar || candidate.photoURL}
                  alt={
                    candidate.nickname || candidate.displayName || candidate.name || candidate.email
                  }
                  className="rounded-full"
                />
              </div>
            )}
            <span className="truncate">
              {candidate.nickname || candidate.displayName || candidate.name || candidate.email}
            </span>
            {isFriend && <span className="ml-auto text-sm text-green-400">已是朋友</span>}
            {isInvited && !isFriend && (
              <span className="ml-auto text-sm text-zinc-400">已發送邀請</span>
            )}
          </div>
        )}
        {invites.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">收到的邀請</p>
            <ul className="space-y-2">
              {invites.map((inv) => (
                <li
                  key={inv.uid}
                  className="flex items-center justify-between gap-2 rounded bg-zinc-800 p-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {inv.avatar && (
                      <div className="relative size-8 shrink-0">
                        <ImageWithFallback
                          src={inv.avatar}
                          alt={inv.nickname}
                          className="rounded-full"
                        />
                      </div>
                    )}
                    <span className="truncate">{inv.nickname}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => handleAccept(inv.uid)} disabled={loading}>
                      接受
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-black"
                      onClick={() => handleDecline(inv.uid)}
                      disabled={loading}
                    >
                      拒絕
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
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
