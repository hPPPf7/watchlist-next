'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';

export default function AccountPage() {
  const { 使用者 } = useUser();
  const [loading, setLoading] = useState(false);

  const 登入 = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    const timeout = setTimeout(() => setLoading(false), 10000); // ⬅️ timeout 在 try 外先定義

    try {
      await signInWithPopup(auth, provider);
      clearTimeout(timeout); // ⬅️ 登入成功清掉 timeout
    } catch (e: any) {
      clearTimeout(timeout); // ⬅️ 登入失敗也清掉 timeout
      if (e?.code === 'auth/popup-closed-by-user') {
        console.warn('使用者關閉登入視窗');
        toast.info('已取消登入');
      } else {
        console.error('登入失敗', e);
        toast.error('登入失敗，請稍後再試');
      }
      setLoading(false);
    }
  };

  const 登出 = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('登出失敗', e);
      toast.error('登出失敗，請稍後再試');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-white">🎬 追劇小助手</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!使用者 ? (
            <>
              <EmptyState text="請先登入帳號以使用完整功能" small />
              <Button
                onClick={登入}
                disabled={loading}
                className="group w-full rounded-lg border border-zinc-600 bg-zinc-700 py-2 text-white transition duration-200 hover:border-blue-600 hover:bg-blue-600"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loading />
                    登入中...
                  </div>
                ) : (
                  <span className="transition-transform group-hover:scale-[1.01]">
                    🚀 使用 Google 登入
                  </span>
                )}
              </Button>
            </>
          ) : (
            <div className="flex flex-col flex-wrap items-center gap-4 sm:flex-row sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {使用者.photoURL && (
                  <div className="relative size-12 shrink-0">
                    <ImageWithFallback
                      src={使用者.photoURL}
                      alt="頭像"
                      className="rounded-full border border-zinc-600 shadow"
                    />
                  </div>
                )}
                <div className="truncate text-left">
                  <p className="truncate font-semibold">{使用者.displayName || '使用者'}</p>
                  <p className="truncate text-sm text-zinc-400">{使用者.email}</p>
                </div>
              </div>
              <Button
                onClick={登出}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-6 py-2 text-white transition duration-200 hover:border-red-600 hover:bg-red-600 sm:w-auto"
              >
                登出
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href="/account/friends">朋友管理</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
