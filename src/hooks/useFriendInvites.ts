'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import type { FriendInvite } from '@/types/FriendInvite';

function getCurrentUser() {
  return getAuth().currentUser;
}

export async function getFriendInvites(): Promise<FriendInvite[]> {
  const user = getCurrentUser();
  if (!user) return [];
  try {
    const ref = collection(db, 'users', user.uid, 'friendInvites');
    const snap = await getDocs(ref);
    return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<FriendInvite, 'uid'>) }));
  } catch (err) {
    console.warn('⚠️ 無法取得邀請列表', err);
    return [];
  }
}

export function useFriendInvites() {
  const [invites, setInvites] = useState<FriendInvite[]>([]);

  useEffect(() => {
    (async () => {
      setInvites(await getFriendInvites());
    })();
  }, []);

  const reload = async () => {
    setInvites(await getFriendInvites());
  };

  return { invites, reload };
}
