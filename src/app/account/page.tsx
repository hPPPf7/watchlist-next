'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
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
    try {
      const timeout = setTimeout(() => setLoading(false), 10000);
      await signInWithPopup(auth, provider);
      clearTimeout(timeout);
    } catch (e) {
      console.error('登入失敗', e);
      setLoading(false);
    }
  };

  const 登出 = () => {
    signOut(auth);
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)] sm:p-8">
      <Card className="w-full max-w-md bg-zinc-900 text-white border border-zinc-700 shadow-xl rounded-2xl overflow-hidden">
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
                className="w-full bg-zinc-700 text-white border border-zinc-600 hover:bg-blue-600 hover:border-blue-600 transition duration-200 rounded-lg py-2 group"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loading />
                    登入中...
                  </div>
                ) : (
                  <span className="group-hover:scale-[1.01] transition-transform">
                    🚀 使用 Google 登入
                  </span>
                )}
              </Button>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                {使用者.photoURL && (
                  <div className="relative w-12 h-12 shrink-0">
                    <ImageWithFallback
                      src={使用者.photoURL}
                      alt="頭像"
                      className="rounded-full border border-zinc-600 shadow"
                    />
                  </div>
                )}
                <div className="text-left truncate">
                  <p className="font-semibold truncate">{使用者.displayName || '使用者'}</p>
                  <p className="text-sm text-zinc-400 truncate">{使用者.email}</p>
                </div>
              </div>
              <Button
                onClick={登出}
                className="bg-zinc-700 text-white border border-zinc-600 hover:bg-red-600 hover:border-red-600 transition duration-200 rounded-lg py-2 px-6 w-full sm:w-auto"
              >
                登出
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
