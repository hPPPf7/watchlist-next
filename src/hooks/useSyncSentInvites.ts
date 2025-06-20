'use client';

import { useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { db, getDocSafe } from '@/lib/firebase';
import { addFriendLocally } from '@/lib/friends';

export function useSyncSentInvites(invitedUids: string[], onSynced?: (uids: string[]) => void) {
  useEffect(() => {
    if (invitedUids.length === 0) return;

    const auth = getAuth();

    const run = async (user: User) => {
      const synced: string[] = [];
      for (const uid of invitedUids) {
        const ref = doc(db, 'users', user.uid, 'friends', uid);
        const snap = await getDocSafe(ref);
        if (snap && snap.exists()) {
          try {
            await addFriendLocally(uid);
            synced.push(uid);
          } catch (err) {
            console.warn('⚠️ 好友同步失敗', err);
          }
        }
      }
      if (synced.length > 0) {
        onSynced?.(synced);
      }
    };

    const current = auth.currentUser;
    if (current) {
      void run(current);
      return;
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        run(user).finally(() => unsub());
      }
    });
    return () => unsub();
  }, [invitedUids, onSynced]);
}
