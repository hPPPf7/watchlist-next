import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  getDoc,
  type DocumentReference,
  type DocumentSnapshot,
  type WithFieldValue,
} from 'firebase/firestore';

// Firebase 設定
const firebaseConfig = {
  apiKey: 'AIzaSyB1LUnhW3aywl1PvmosOtb__RlmyrWjr9s',
  authDomain: 'watchlist-tracker-57d04.firebaseapp.com',
  projectId: 'watchlist-tracker-57d04',
  storageBucket: 'watchlist-tracker-57d04.appspot.com',
  messagingSenderId: '474833010924',
  appId: '1:474833010924:web:9d5a2b165e89722521a5c9',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// 正式 Firestore 初始化（🔥 這樣才能避免 fetch streams）
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export { app };

// ✅ 正確版 getDocSafe（這版才對）
export async function getDocSafe<T extends WithFieldValue<unknown> = any>(
  ref: DocumentReference<T>,
): Promise<DocumentSnapshot<T> | null> {
  try {
    const snap = await getDoc(ref);
    return snap as DocumentSnapshot<T>;
  } catch (e) {
    console.warn('⚠️ getDoc 失敗（已忽略錯誤）', e);
    return null;
  }
}
