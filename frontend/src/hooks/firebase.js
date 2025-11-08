import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";

// Read config from Vite env variables. Create a .env with VITE_FIREBASE_* values
// e.g. VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, etc.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let auth;
try {
  // Only initialize if we have at least the apiKey + authDomain
  if (firebaseConfig.apiKey && firebaseConfig.authDomain) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
} catch (e) {
  // If initialization fails, leave auth undefined and let hook surface the error
  // console.warn("Firebase init error:", e);
}

export function useFirebaseAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setError(
        new Error("Firebase not configured. Set VITE_FIREBASE_* env vars.")
      );
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
  };

  // Helper: send the ID token to your backend for verification / creating a session
  const sendIdTokenToBackend = async (
    endpoint = "/auth/verify-token",
    apiUrl
  ) => {
    const token = await getIdToken();
    if (!token) throw new Error("No ID token available");

    const base =
      apiUrl || import.meta.env.VITE_API_URL || "http://localhost:8000";
    const res = await fetch(`${base}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res;
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    getIdToken,
    sendIdTokenToBackend,
  };
}

export default useFirebaseAuth;
