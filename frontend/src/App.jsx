import React, { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import SignRecognition from "./components/SignRecognition";
import "./App.css";
import useFirebaseAuth from "./hooks/firebase";
import LandingPage from "./pages/LandingPage";

export default function App() {
  const { user, signInWithGoogle, signOut, loading, error } = useFirebaseAuth();
  const [showLanding, setShowLanding] = useState(true);

  // When user signs out, return to landing state so next sign-in shows landing again
  useEffect(() => {
    if (!user) setShowLanding(true);
  }, [user]);

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <HomePage onSignIn={handleSignIn} isLoading={loading} authError={error} />
    );
  }
  // Show landing page first, then continue to the main app (SignRecognition)
  if (showLanding) {
    return (
      <LandingPage
        user={user}
        onContinue={() => setShowLanding(false)}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="app">
      <header>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1>Sign Language Recognition</h1>
            <p>ASL Recognition using MediaPipe and Machine Learning</p>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              padding: "0.5rem 1rem",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              color: "var(--text)",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Sign Out
          </button>
        </div>
      </header>
      <main>
        <SignRecognition />
      </main>
    </div>
  );
}
