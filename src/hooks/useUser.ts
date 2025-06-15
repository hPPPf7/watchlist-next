'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';

// Firebase 初始化
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 定義 UserContext 的型別
type 使用者資訊 = FirebaseUser | null;

interface 使用者Context型別 {
  使用者: 使用者資訊;
  登入: () => Promise<void>;
  登出: () => Promise<void>;
  isLoading: boolean;
}

// 建立 UserContext
const UserContext = createContext<使用者Context型別 | undefined>(undefined);

// ✅ UserProvider
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
    });
    return () => unsubscribe();
  }, []);

  async function 登入() {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error('登入失敗', e);
    }
  }

  async function 登出() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('登出失敗', e);
    }
  }

  return React.createElement(
    UserContext.Provider,
    { value: { 使用者, 登入, 登出, isLoading } },
    children,
  );
}

// ✅ useUser
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser 必須在 UserProvider 中使用');
  }
  return context;
}

// ✅ useIsLoggedIn：簡化判斷登入狀態
export function useIsLoggedIn() {
  const { 使用者, isLoading } = useUser();
  return !!使用者 && !isLoading;
}
