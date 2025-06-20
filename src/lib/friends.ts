import { db, getDocSafe } from '@/lib/firebase';
import { collection, doc, getDocs, query, where, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function getCurrentUser() {
  return getAuth().currentUser;
}

export async function addFriend(identifier: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) throw new Error('未登入');

  let uid = identifier.trim();
  let snap;
  if (uid.includes('@')) {
    const q = query(collection(db, 'users'), where('email', '==', uid));
    const qs = await getDocs(q);
    if (qs.empty) throw new Error('找不到用戶');
    snap = qs.docs[0];
    uid = snap.id;
  } else {
    snap = await getDocSafe(doc(db, 'users', uid));
    if (!snap || !snap.exists()) throw new Error('找不到用戶');
  }
  const data = snap.data() as any;
  const nickname = data?.nickname || data?.displayName || data?.name || data?.email || uid;
  const avatar = data?.avatar || data?.photoURL || '';

  await setDoc(doc(db, 'users', user.uid, 'friends', uid), { nickname, avatar });
}

export async function removeFriend(uid: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) throw new Error('未登入');
  await deleteDoc(doc(db, 'users', user.uid, 'friends', uid));
}
