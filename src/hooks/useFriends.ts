'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import type { Friend } from '@/types/Friend';

function getCurrentUser() {
  return getAuth().currentUser;
}

export async function getFriends(): Promise<Friend[]> {
  const user = getCurrentUser();
  if (!user) return [];
  try {
    const ref = collection(db, 'users', user.uid, 'friends');
    const snap = await getDocs(ref);
    return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<Friend, 'uid'>) }));
  } catch (err) {
    console.warn('⚠️ 無法取得朋友列表', err);
    return [];
  }
}

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    (async () => {
      setFriends(await getFriends());
    })();
  }, []);

  const reload = async () => {
    setFriends(await getFriends());
  };

  return { friends, reload };
}
