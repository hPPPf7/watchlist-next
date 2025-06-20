import { db, getDocSafe } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
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

export async function findUserByEmail(email: string) {
  const q = query(collection(db, 'users'), where('email', '==', email.trim()));
  const qs = await getDocs(q);
  if (qs.empty) return null;
  const snap = qs.docs[0];
  return { uid: snap.id, ...(snap.data() as any) };
}

export async function addFriendByEmail(email: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) throw new Error('未登入');

  const target = await findUserByEmail(email);
  if (!target) throw new Error('找不到用戶');

  const nickname =
    target.nickname || target.displayName || target.name || target.email || target.uid;
  const avatar = target.avatar || target.photoURL || '';

  await setDoc(doc(db, 'users', user.uid, 'friends', target.uid), { nickname, avatar });

  const meSnap = await getDocSafe(doc(db, 'users', user.uid));
  if (meSnap && meSnap.exists()) {
    const me = meSnap.data() as any;
    const myNickname = me.nickname || me.displayName || me.name || me.email || user.uid;
    const myAvatar = me.avatar || me.photoURL || '';
    await setDoc(doc(db, 'users', target.uid, 'friends', user.uid), {
      nickname: myNickname,
      avatar: myAvatar,
    });
  }
}

export async function removeFriend(uid: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) throw new Error('未登入');
  await deleteDoc(doc(db, 'users', user.uid, 'friends', uid));
}

export async function addFriendLocally(uid: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) throw new Error('未登入');

  const targetSnap = await getDocSafe(doc(db, 'users', uid));
  if (!targetSnap || !targetSnap.exists()) throw new Error('找不到用戶');
  const target = targetSnap.data() as any;
  const nickname = target.nickname || target.displayName || target.name || target.email || uid;
  const avatar = target.avatar || target.photoURL || '';

  await setDoc(doc(db, 'users', user.uid, 'friends', uid), { nickname, avatar });
}

export async function addFriendByUid(uid: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) throw new Error('未登入');

  const targetSnap = await getDocSafe(doc(db, 'users', uid));
  if (!targetSnap || !targetSnap.exists()) throw new Error('找不到用戶');
  const target = targetSnap.data() as any;
  const nickname = target.nickname || target.displayName || target.name || target.email || uid;
  const avatar = target.avatar || target.photoURL || '';

  await setDoc(doc(db, 'users', user.uid, 'friends', uid), { nickname, avatar });

  const meSnap = await getDocSafe(doc(db, 'users', user.uid));
  if (meSnap && meSnap.exists()) {
    const me = meSnap.data() as any;
    const myNickname = me.nickname || me.displayName || me.name || me.email || user.uid;
    const myAvatar = me.avatar || me.photoURL || '';
    try {
      await setDoc(doc(db, 'users', uid, 'friends', user.uid), {
        nickname: myNickname,
        avatar: myAvatar,
      });
    } catch (err) {
      console.warn('⚠️ 無法更新對方好友列表', err);
    }
  }
}

export async function sendFriendInvite(email: string): Promise<string> {
  const user = getCurrentUser();
  if (!user) throw new Error('未登入');

  const target = await findUserByEmail(email);
  if (!target) throw new Error('找不到用戶');

  const meSnap = await getDocSafe(doc(db, 'users', user.uid));
  const me = meSnap && meSnap.exists() ? (meSnap.data() as any) : {};
  const nickname = me.nickname || me.displayName || me.name || me.email || user.uid;
  const avatar = me.avatar || me.photoURL || '';

  await setDoc(doc(db, 'users', target.uid, 'friendInvites', user.uid), {
    nickname,
    avatar,
    email: user.email || '',
    createdAt: serverTimestamp(),
  });

  return target.uid;
}

export async function acceptFriendInvite(uid: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) throw new Error('未登入');

  const targetSnap = await getDocSafe(doc(db, 'users', uid));
  if (!targetSnap || !targetSnap.exists()) throw new Error('找不到用戶');
  const target = targetSnap.data() as any;
  const nickname = target.nickname || target.displayName || target.name || target.email || uid;
  const avatar = target.avatar || target.photoURL || '';

  await setDoc(doc(db, 'users', user.uid, 'friends', uid), {
    nickname,
    avatar,
  });
  await deleteDoc(doc(db, 'users', user.uid, 'friendInvites', uid));
}

export async function declineFriendInvite(uid: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) throw new Error('未登入');
  await deleteDoc(doc(db, 'users', user.uid, 'friendInvites', uid));
}

export async function syncInvitedFriends(uids: string[]): Promise<string[]> {
  const user = getCurrentUser();
  if (!user || uids.length === 0) return [];

  const added: string[] = [];
  for (const uid of uids) {
    const ref = doc(db, 'users', uid, 'friends', user.uid);
    const snap = await getDocSafe(ref);
    if (snap && snap.exists()) {
      try {
        await addFriendLocally(uid);
        added.push(uid);
      } catch (err) {
        console.warn('⚠️ 同步好友失敗', err);
      }
    }
  }
  return added;
}
