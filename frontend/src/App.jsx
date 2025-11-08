import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // NEW
import HomePage from "./pages/HomePage";
import SignRecognition from "./components/SignRecognition";
import LandingPage from "./pages/LandingPage";
import LettersMode from "./pages/LettersMode.jsx";              // NEW
import "./styles/competition.css";                              // NEW (styles for letters page)
import "./App.css";
import useFirebaseAuth from "./hooks/firebase";

export default function App() {
  const { user, signInWithGoogle, signOut, loading, error } = useFirebaseAuth();
  const [showLanding, setShowLanding] = useState(true);

  // keep original behavior
  useEffect(() => {
    if (!user) setShowLanding(true);
  }, [user]);

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // This component preserves your original conditional rendering for "/"
  const RootSwitcher = () => {
    if (!user) {
      return (
        <HomePage onSignIn={handleSignIn} isLoading={loading} authError={error} />
      );
    }

    if (showLanding) {
      return (
        <LandingPage
          user={user}
          onContinue={() => setShowLanding(false)}
          onSignOut={handleSignOut}
        />
      );
    }

    // Your original signed-in app view
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
  };

  // Router: keep "/" exactly the same, add "/letters"
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/letters" element={<LettersMode />} />
        <Route path="/*" element={<RootSwitcher />} />
      </Routes>
    </BrowserRouter>
  );
}