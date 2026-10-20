import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
export const firebaseReady = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
const app = firebaseReady ? initializeApp(config) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export function onUserChanged(callback) {
  if (!auth) { queueMicrotask(() => callback(null)); return () => {}; }
  return onAuthStateChanged(auth, callback);
}
export async function signUp(email, password) {
  if (!auth) throw new Error('Firebase is not configured.');
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}
export async function signIn(email, password) {
  if (!auth) throw new Error('Firebase is not configured.');
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}
export async function signOutUser() { if (auth) await signOut(auth); }
export async function loadUserWorkspace(uid) {
  if (!db) throw new Error('Firebase is not configured.');
  const snapshot = await getDoc(doc(db, 'userWorkspaces', uid));
  return snapshot.exists() ? snapshot.data() : null;
}
export async function saveUserWorkspace(uid, workspace) {
  if (!db) throw new Error('Firebase is not configured.');
  const safe = {
    balance: Number(workspace.balance) || 0,
    initialBalance: Number(workspace.initialBalance) || 10000,
    holdings: workspace.holdings && typeof workspace.holdings === 'object' ? workspace.holdings : {},
    trades: Array.isArray(workspace.trades) ? workspace.trades.slice(0, 200) : [],
    mode: 'demo',
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'userWorkspaces', uid), safe, { merge: true });
}
