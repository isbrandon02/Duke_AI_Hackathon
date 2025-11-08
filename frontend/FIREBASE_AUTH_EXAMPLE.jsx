/**
 * Firebase Authentication Example for React
 *
 * This file demonstrates how to integrate Firebase Authentication
 * with your React frontend and send ID tokens to your FastAPI backend.
 *
 * Setup:
 * 1. Install Firebase SDK: npm install firebase
 * 2. Get your Firebase config from Firebase Console → Project Settings
 * 3. Create a firebase.js file with your config
 * 4. Use this component as a reference
 */

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// ⚠️ Replace with your Firebase config
// Get this from Firebase Console → Project Settings → General → Your apps
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Your backend API URL
const API_URL = "http://localhost:8000";

export default function FirebaseAuthExample() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendData, setBackendData] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // User is signed in, fetch data from backend
        fetchUserDataFromBackend();
      } else {
        setBackendData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Function to send authenticated request to backend
  const fetchUserDataFromBackend = async () => {
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBackendData(data);
      } else {
        console.error("Failed to fetch user data from backend");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  // Sign up with email and password
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User created:", userCredential.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User signed in:", userCredential.user);
      // fetchUserDataFromBackend will be called automatically by onAuthStateChanged
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      console.log("User signed in with Google:", userCredential.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setBackendData(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Send authenticated request to a protected endpoint
  const callProtectedEndpoint = async () => {
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch(`${API_URL}/auth/verify-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert("Token verified! User: " + data.user.email);
      } else {
        const errorData = await response.json();
        alert("Error: " + errorData.detail);
      }
    } catch (err) {
      console.error("Error calling protected endpoint:", err);
      alert("Error calling protected endpoint");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Firebase Authentication Example</h1>

      {!user ? (
        <div>
          <h2>Sign In / Sign Up</h2>

          <form onSubmit={handleSignIn} style={{ marginBottom: "20px" }}>
            <div style={{ marginBottom: "10px" }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{ padding: "10px 20px" }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                disabled={loading}
                style={{ padding: "10px 20px" }}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{ padding: "10px 20px" }}
              >
                Sign In with Google
              </button>
            </div>
          </form>

          {error && (
            <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
          )}
        </div>
      ) : (
        <div>
          <h2>Welcome, {user.email}!</h2>
          <p>UID: {user.uid}</p>
          <p>Email Verified: {user.emailVerified ? "Yes" : "No"}</p>

          {backendData && (
            <div
              style={{
                backgroundColor: "#f0f0f0",
                padding: "15px",
                marginTop: "20px",
                borderRadius: "5px",
              }}
            >
              <h3>Backend Data:</h3>
              <pre>{JSON.stringify(backendData, null, 2)}</pre>
            </div>
          )}

          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button
              onClick={callProtectedEndpoint}
              style={{ padding: "10px 20px" }}
            >
              Test Protected Endpoint
            </button>
            <button onClick={handleSignOut} style={{ padding: "10px 20px" }}>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
