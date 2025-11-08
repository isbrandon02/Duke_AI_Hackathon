import React, { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import SignRecognition from "./components/SignRecognition";
import "./App.css";
import useFirebaseAuth from "./hooks/firebase";
import LandingPage from "./pages/LandingPage";
import LearningPage from "./pages/LearningPage";
import ModulePage from "./pages/ModulePage";
import CompetePage from "./pages/CompetePage";

export default function App() {
  const { user, signInWithGoogle, signOut, loading, error } = useFirebaseAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [selectedMode, setSelectedMode] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  // When user signs out, return to landing state so next sign-in shows landing again
  useEffect(() => {
    if (!user) setShowLanding(true);
  }, [user]);
  useEffect(() => {
    if (!user) {
      setShowLanding(true);
      setSelectedMode(null);
    }
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
        onContinue={(mode) => {
          setSelectedMode(mode);
          setShowLanding(false);
        }}
        onSignOut={handleSignOut}
      />
    );
  }
  // Render different pages depending on selected mode
  if (selectedMode === "learning") {
    // If a module is active, open the module page; otherwise show the pathway
    if (activeModule) {
      return (
        <ModulePage
          moduleId={activeModule}
          onBack={() => setActiveModule(null)}
        />
      );
    }
    return (
      <LearningPage
        onBack={() => setShowLanding(true)}
        onSelectModule={(moduleId) => setActiveModule(moduleId)}
      />
    );
  }
  if (selectedMode === "compete") {
    return <CompetePage onBack={() => setShowLanding(true)} />;
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
        <SignRecognition mode={selectedMode} />
      </main>
    </div>
  );
}
