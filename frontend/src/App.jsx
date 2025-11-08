import React, { useState } from "react";
import HomePage from "./pages/HomePage";
import SignRecognition from "./components/SignRecognition";
import "./App.css";

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignIn = () => {
    // TODO: Replace with actual Firebase authentication
    setIsSignedIn(true);
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
  };

  if (!isSignedIn) {
    return <HomePage onSignIn={handleSignIn} />;
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
