import React from "react";
import "./LandingPage.css";
import "./HomePage.css"; // reuse logo styles
import logo from "../../../gesturify_logo.png";

export default function LandingPage({ user, onContinue, onSignOut }) {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="home-logo" style={{ alignItems: "center" }}>
          <img src={logo} alt="Gesturify logo" className="logo-img" />
          <span className="logo-text">Gesturify</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 14, color: "#374151" }}>
            {user?.email || user?.displayName || "Signed in"}
          </div>
          <button className="btn-ghost" onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="landing-main">
        <div className="landing-container">
          <section className="panel left-panel">
            <div className="panel-inner">
              <div className="mode-emoji">📘</div>
              <h2 className="mode-title">Learning Mode</h2>
              <p className="mode-desc">
                Practice signs at your pace. Guided exercises help you learn and
                improve accuracy with immediate feedback.
              </p>
              <button
                className="mode-btn btn-learn"
                onClick={() => onContinue && onContinue("learning")}
              >
                Start Learning
              </button>
            </div>
          </section>

          <div className="divider" />

          <section className="panel right-panel">
            <div className="panel-inner">
              <div className="mode-emoji">🏆</div>
              <h2 className="mode-title">Compete Mode</h2>
              <p className="mode-desc">
                Test your skills in time-based challenges and leaderboards. See
                how you compare with other learners.
              </p>
              <button
                className="mode-btn btn-compete"
                onClick={() => onContinue && onContinue("compete")}
              >
                Start Competing
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
