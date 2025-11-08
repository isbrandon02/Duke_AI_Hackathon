import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Read config from Vite env variables. Create a .env.local with VITE_FIREBASE_* values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** ---------- Initialize (idempotent) ---------- **/
let app;
let _auth;
let _db;

try {
  if (firebaseConfig.apiKey && firebaseConfig.authDomain) {
    // Avoid "App already exists" if this file is imported more than once
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    _auth = getAuth(app);
    _db = getFirestore(app);
  }
} catch (e) {
  // Leave _auth/_db undefined; hook will surface an error
  // console.warn("Firebase init error:", e);
}

/** Expose named exports for components that need them (Leaderboard, LettersMode) */
export const auth = _auth;
export const db = _db;

/** ---------- Existing hook (unchanged behavior) ---------- **/
export function useFirebaseAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setError(new Error("Firebase not configured. Set VITE_FIREBASE_* env vars."));
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    if (!auth) {
      setError(new Error("Firebase not configured"));
      setLoading(false);
      return null;
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;
      setUser(currentUser);
      setLoading(false);
      return currentUser;
    } catch (e) {
      setError(e);
      setLoading(false);
      return null;
    }
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setUser(null);
  };

  const getIdToken = async (forceRefresh = false) => {
    if (!auth || !auth.currentUser) return null;
    return auth.currentUser.getIdToken(forceRefresh);
    // Note: callers should handle a null return value.
  };

  const sendIdTokenToBackend = async (endpoint = "/auth/verify-token", apiUrl) => {
    const token = await getIdToken();
    if (!token) throw new Error("No ID token available");
    const base = apiUrl || import.meta.env.VITE_API_URL || "http://localhost:8000";
    const res = await fetch(`${base}${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    return res;
  };

  return { user, loading, error, signInWithGoogle, signOut, getIdToken, sendIdTokenToBackend };
}

export default useFirebaseAuth;