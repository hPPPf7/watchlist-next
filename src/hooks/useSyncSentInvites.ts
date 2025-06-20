'use client';

import { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { db, getDocSafe } from '@/lib/firebase';
import { addFriendLocally } from '@/lib/friends';

export function useSyncSentInvites(invitedUids: string[], onSynced?: (uids: string[]) => void) {
  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user || invitedUids.length === 0) return;

    (async () => {
      const synced: string[] = [];
      for (const uid of invitedUids) {
        const ref = doc(db, 'users', uid, 'friends', user.uid);
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
    })();
  }, [invitedUids, onSynced]);
}
