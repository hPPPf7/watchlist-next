import { doc, setDoc } from 'firebase/firestore';
import { type User } from 'firebase/auth';
import { db, getDocSafe } from './firebase';

export async function ensureUserDocument(user: User | null): Promise<void> {
  if (!user) return;
  const ref = doc(db, 'users', user.uid);
  const snap = await getDocSafe(ref);
  const baseData = {
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    nickname: user.displayName || user.email || user.uid,
  };
  if (!snap || !snap.exists()) {
    await setDoc(ref, baseData);
  } else {
    const data = snap.data() as any;
    const updates: any = {};
    if (!data.email && user.email) updates.email = user.email;
    if (!data.displayName && user.displayName) updates.displayName = user.displayName;
    if (!data.photoURL && user.photoURL) updates.photoURL = user.photoURL;
    if (!data.nickname && (user.displayName || user.email)) {
      updates.nickname = user.displayName || user.email;
    }
    if (Object.keys(updates).length > 0) {
      await setDoc(ref, updates, { merge: true });
    }
  }
}
