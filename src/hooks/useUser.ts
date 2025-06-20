'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { toast } from 'sonner';
import { auth, provider } from '@/lib/firebase'; // ✅ 改用已初始化的 auth 與 provider
import { ensureUserDocument } from '@/lib/users';

// --- 型別定義 ---
type 使用者資訊 = FirebaseUser | null;

interface 使用者Context型別 {
  使用者: 使用者資訊;
  登入: () => Promise<void>;
  登出: () => Promise<void>;
  isLoading: boolean;
}

// --- 建立 context ---
const UserContext = createContext<使用者Context型別 | undefined>(undefined);

// --- Provider 元件 ---
interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [使用者, 設定使用者] = useState<使用者資訊>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      設定使用者(user);
      setIsLoading(false);
      ensureUserDocument(user).catch((err) => console.warn('⚠️ 無法建立使用者資料', err));
    });
    return () => unsubscribe();
  }, []);

  async function 登入() {
    try {
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      if (e?.code === 'auth/popup-closed-by-user') {
        console.warn('使用者關閉登入視窗');
        toast.info('已取消登入');
      } else {
        console.error('登入失敗', e);
        toast.error('登入失敗，請稍後再試');
      }
    }
  }

  async function 登出() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('登出失敗', e);
      toast.error('登出失敗，請稍後再試');
    }
  }

  return React.createElement(
    UserContext.Provider,
    { value: { 使用者, 登入, 登出, isLoading } },
    children,
  );
}

// --- hooks ---
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser 必須在 UserProvider 中使用');
  }
  return context;
}

export function useIsLoggedIn() {
  const { 使用者, isLoading } = useUser();
  return !!使用者 && !isLoading;
}
