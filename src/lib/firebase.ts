import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  getDoc,
  type DocumentReference,
  type DocumentSnapshot,
  type WithFieldValue,
} from 'firebase/firestore';

// Firebase 設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
